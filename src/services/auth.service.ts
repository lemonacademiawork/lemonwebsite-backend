import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt";
import crypto from "crypto";
import { prisma } from "../config/database";
import { UserRole, TrainerRequestStatus } from "@prisma/client";
import { sendWhatsAppOTP } from "./whatsapp.service";

interface RegisterData {
    name?: string;
    phone?: string;
    email?: string;
    password: string;
}

interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
}

interface GoogleUserData {
    googleId: string;
    email: string;
    name?: string;
}

/* =========================================================
   REGISTER
========================================================= */

export const registerUser = async (data: RegisterData) => {
    const {
        name,
        phone,
        password,
        email,
    } = data;

    if (!phone && !email) {
        throw new Error("Phone number or email is required");
    }

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    const trimmedPhone = phone && phone.trim() ? phone.trim() : null;
    const trimmedEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
                ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
            ],
        },
    });

    if (existingUser) {
        if (trimmedPhone && existingUser.phone === trimmedPhone) {
            throw new Error("Phone number already registered");
        }
        if (trimmedEmail && existingUser.email === trimmedEmail) {
            throw new Error("Email already registered");
        }
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    const referralCode =
        `LEMON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Check if there is an approved trainer request matching this phone or email
    const approvedRequest = await prisma.trainerRequest.findFirst({
        where: {
            status: TrainerRequestStatus.APPROVED,
            OR: [
                ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
                ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
            ],
        },
        orderBy: { updatedAt: "desc" },
    });

    const roleToAssign = approvedRequest ? UserRole.TRAINER : UserRole.STUDENT;

    const user = await prisma.user.create({
        data: {
            name: name || (approvedRequest?.name ?? "Student"),
            phone: trimmedPhone,
            email: trimmedEmail,
            passwordHash: hashedPassword,
            role: roleToAssign,

            studentProfile: {
                create: {
                    name: name || "Student",
                    phone: trimmedPhone,
                    referralCode,
                },
            },

            ...(approvedRequest ? {
                trainerProfile: {
                    create: {
                        name: name || approvedRequest.name || "Trainer",
                        phone: trimmedPhone,
                        expertise: approvedRequest.expertise,
                        bio: approvedRequest.bio || `Instructor specializing in ${approvedRequest.expertise}`,
                        designation: "Instructor at Lemon Academy",
                    },
                },
            } : {}),
        },

        include: {
            studentProfile: true,
            trainerProfile: true,
        },
    });

    if (approvedRequest && !approvedRequest.userId) {
        await prisma.trainerRequest.update({
            where: { id: approvedRequest.id },
            data: { userId: user.id },
        });
    }

    const {
        passwordHash: _passwordHash,
        ...safeUser
    } = user;

    return safeUser;
};

/* =========================================================
   LOGIN (PHONE OR EMAIL)
========================================================= */

export const loginUser = async (
    identifier: string,
    password: string
) => {
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
        throw new Error("Phone number or email is required");
    }

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    let user = await prisma.user.findFirst({
        where: isEmail
            ? { email: trimmed.toLowerCase() }
            : { phone: trimmed },
        include: {
            studentProfile: true,
            trainerProfile: true,
            enrollments: {
                include: {
                    course: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new Error(isEmail ? "Invalid email or password" : "Invalid phone number or password");
    }

    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error(isEmail ? "Invalid email or password" : "Invalid phone number or password");
    }

    // Auto-promote to TRAINER if user has an approved trainer request
    if (user.role === UserRole.STUDENT) {
        const approvedRequest = await prisma.trainerRequest.findFirst({
            where: {
                status: TrainerRequestStatus.APPROVED,
                OR: [
                    { userId: user.id },
                    ...(user.phone ? [{ phone: user.phone }] : []),
                    ...(user.email ? [{ email: user.email }] : []),
                ],
            },
            orderBy: { updatedAt: "desc" },
        });

        if (approvedRequest) {
            // Update user role to TRAINER
            await prisma.user.update({
                where: { id: user.id },
                data: { role: UserRole.TRAINER },
            });

            // Ensure trainerProfile exists
            let trainerProfile = user.trainerProfile;
            if (!trainerProfile) {
                trainerProfile = await prisma.trainerProfile.create({
                    data: {
                        userId: user.id,
                        name: approvedRequest.name || user.name || "Trainer",
                        phone: approvedRequest.phone || user.phone,
                        expertise: approvedRequest.expertise,
                        bio: approvedRequest.bio || `Instructor specializing in ${approvedRequest.expertise}`,
                        designation: "Instructor at Lemon Academy",
                    },
                });
            }

            if (!approvedRequest.userId) {
                await prisma.trainerRequest.update({
                    where: { id: approvedRequest.id },
                    data: { userId: user.id },
                });
            }

            user = {
                ...user,
                role: UserRole.TRAINER,
                trainerProfile,
            };
        }
    }

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    const refreshToken = generateRefreshToken(
        user.id
    );

    const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        10
    );

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshTokenHash,
        },
    });

    const {
        passwordHash: _passwordHash,
        refreshTokenHash: _refreshTokenHash,
        ...safeUser
    } = user;

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const loginWithGoogle = async (
    googleUser: GoogleUserData
) => {
    const {
        googleId,
        email,
        name,
    } = googleUser;

    /*
     * 1. Check whether this Google account
     * already exists.
     */
    let user = await prisma.user.findUnique({
        where: {
            googleId,
        },
        include: {
            studentProfile: true,
        },
    });

    /*
     * 2. If Google ID doesn't exist,
     * check using email.
     */
    if (!user) {
        user = await prisma.user.findFirst({
            where: {
                email,
            },
            include: {
                studentProfile: true,
            },
        });
    }

    /*
     * 3. Existing user
     */
    if (user) {
        if (!user.isActive) {
            throw new Error(
                "Your account is inactive"
            );
        }

        /*
         * Link Google account to existing user
         * if it isn't already linked.
         */
        if (!user.googleId) {
            user = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    googleId,
                },
                include: {
                    studentProfile: true,
                },
            });
        }
    }

    /*
     * 4. New Google user
     */
    if (!user) {
        const referralCode =
            `LEMON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

        const randomPasswordHash =
            await bcrypt.hash(
                crypto.randomUUID(),
                10
            );

        user = await prisma.user.create({
            data: {
                email,
                googleId,
                passwordHash: randomPasswordHash,

                studentProfile: {
                    create: {
                        name: name || "Student",
                        referralCode,
                    },
                },
            },

            include: {
                studentProfile: true,
                trainerProfile: true,
            },
        });
    }

    // Auto-promote to TRAINER if user has an approved trainer request
    if (user.role === UserRole.STUDENT) {
        const approvedRequest = await prisma.trainerRequest.findFirst({
            where: {
                status: TrainerRequestStatus.APPROVED,
                OR: [
                    { userId: user.id },
                    ...(user.email ? [{ email: user.email }] : []),
                ],
            },
            orderBy: { updatedAt: "desc" },
        });

        if (approvedRequest) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: UserRole.TRAINER },
            });

            let trainerProfile = await prisma.trainerProfile.findUnique({
                where: { userId: user.id },
            });

            if (!trainerProfile) {
                trainerProfile = await prisma.trainerProfile.create({
                    data: {
                        userId: user.id,
                        name: approvedRequest.name || user.name || "Trainer",
                        phone: approvedRequest.phone || user.phone,
                        expertise: approvedRequest.expertise,
                        bio: approvedRequest.bio || `Instructor specializing in ${approvedRequest.expertise}`,
                        designation: "Instructor at Lemon Academy",
                    },
                });
            }

            if (!approvedRequest.userId) {
                await prisma.trainerRequest.update({
                    where: { id: approvedRequest.id },
                    data: { userId: user.id },
                });
            }

            user = {
                ...user,
                role: UserRole.TRAINER,
            };
        }
    }

    /*
     * 5. Generate YOUR application's
     * access token and refresh token.
     */
    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    const refreshToken = generateRefreshToken(
        user.id
    );

    /*
     * 6. Hash refresh token before
     * storing it in database.
     */
    const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        10
    );

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshTokenHash,
        },
    });

    /*
     * 7. Remove sensitive information
     * before returning user.
     */
    const {
        passwordHash: _passwordHash,
        refreshTokenHash: _refreshTokenHash,
        ...safeUser
    } = user;

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

/* =========================================================
   REFRESH TOKEN
========================================================= */

export const refreshUser = async (
    refreshToken: string
) => {
    const secret =
        process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new Error(
            "JWT_REFRESH_SECRET is missing from environment variables"
        );
    }

    let decoded: RefreshTokenPayload;

    try {
        decoded = jwt.verify(
            refreshToken,
            secret
        ) as RefreshTokenPayload;
    } catch (error) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }

    if (
        !decoded ||
        typeof decoded.userId !== "string"
    ) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });

    if (!user) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }

    if (!user.isActive) {
        throw new Error(
            "Your account is inactive"
        );
    }

    if (!user.refreshTokenHash) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }

    const isRefreshTokenValid =
        await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash
        );

    if (!isRefreshTokenValid) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }

    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    return {
        accessToken,
    };
};

export const logoutUser = async (
    userId: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            refreshTokenHash: null,
        },
    });

    return {
        message: "Logged out successfully",
    };
};

/* =========================================================
   FORGOT PASSWORD (PHONE OR EMAIL)
========================================================= */

export const forgotPassword = async (identifier: string) => {
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
        throw new Error("Phone number or email is required");
    }

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    const user = await prisma.user.findFirst({
        where: isEmail
            ? { email: trimmed.toLowerCase() }
            : { phone: trimmed },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hash of both hex token and 6-digit OTP code so either can be used
    const resetTokenHash = await bcrypt.hash(
        otpCode,
        10
    );

    const resetPasswordExpiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            resetPasswordToken: resetTokenHash,
            resetPasswordExpiresAt,
        },
    });

    // If user has a registered phone number, send WhatsApp OTP via ZoePact template 401355
    let whatsappResult = null;
    if (user.phone) {
        whatsappResult = await sendWhatsAppOTP(user.phone, otpCode);
    }

    const frontendUrl = (process.env.FRONTEND_URL || "https://course-website-f.vercel.app").replace(/\/$/, "");
    const resetParam = user.phone
        ? `phone=${encodeURIComponent(user.phone)}`
        : `email=${encodeURIComponent(user.email || "")}`;
    const resetUrl = `${frontendUrl}/reset-password?token=${otpCode}&${resetParam}`;

    return {
        message: "Password reset OTP sent successfully",
        otpCode,
        resetToken: otpCode,
        resetUrl,
        whatsappSent: whatsappResult?.success ?? false,
    };
};

/* =========================================================
   RESET PASSWORD
========================================================= */

interface ResetPasswordData {
    token: string;
    newPassword: string;
    phone?: string;
    email?: string;
}

export const resetPassword = async (data: ResetPasswordData) => {
    const { token, newPassword, phone, email } = data;

    if (!token || typeof token !== "string" || !token.trim()) {
        throw new Error("Reset token is required");
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    let matchedUser = null;

    if (phone && typeof phone === "string" && phone.trim()) {
        const user = await prisma.user.findFirst({
            where: { phone: phone.trim() },
        });

        if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
            throw new Error("Invalid or expired reset token");
        }

        if (user.resetPasswordExpiresAt < new Date()) {
            throw new Error("Reset token has expired");
        }

        const isTokenValid = await bcrypt.compare(token.trim(), user.resetPasswordToken);
        if (!isTokenValid) {
            throw new Error("Invalid or expired reset token");
        }

        matchedUser = user;
    } else if (email && typeof email === "string" && email.trim()) {
        const user = await prisma.user.findFirst({
            where: { email: email.trim().toLowerCase() },
        });

        if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
            throw new Error("Invalid or expired reset token");
        }

        if (user.resetPasswordExpiresAt < new Date()) {
            throw new Error("Reset token has expired");
        }

        const isTokenValid = await bcrypt.compare(token.trim(), user.resetPasswordToken);
        if (!isTokenValid) {
            throw new Error("Invalid or expired reset token");
        }

        matchedUser = user;
    } else {
        const activeUsers = await prisma.user.findMany({
            where: {
                resetPasswordExpiresAt: {
                    gt: new Date(),
                },
                resetPasswordToken: {
                    not: null,
                },
            },
        });

        for (const user of activeUsers) {
            if (user.resetPasswordToken) {
                const isTokenValid = await bcrypt.compare(token.trim(), user.resetPasswordToken);
                if (isTokenValid) {
                    matchedUser = user;
                    break;
                }
            }
        }

        if (!matchedUser) {
            throw new Error("Invalid or expired reset token");
        }
    }

    if (!matchedUser.isActive) {
        throw new Error("Your account is inactive");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: {
            id: matchedUser.id,
        },
        data: {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiresAt: null,
            refreshTokenHash: null,
        },
    });

    return {
        message: "Password reset successful. You can now log in with your new password.",
    };
};