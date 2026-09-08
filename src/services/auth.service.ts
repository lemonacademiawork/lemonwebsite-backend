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
   PHONE & USER LOOKUP HELPER
========================================================= */

// In-memory fallback OTP storage for pre-registration or rapid OTP verification
interface StoredOtpInfo {
    hash: string;
    expiresAt: number;
    phone?: string;
    email?: string;
}
export const otpMemoryCache = new Map<string, StoredOtpInfo>();

export const saveStandaloneOtp = async (identifier: string, otpCode: string) => {
    const hash = await bcrypt.hash(otpCode, 10);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const trimmed = identifier.trim().toLowerCase();
    const digits = trimmed.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    otpMemoryCache.set(trimmed, { hash, expiresAt, phone: identifier });
    if (digits) otpMemoryCache.set(digits, { hash, expiresAt, phone: identifier });
    if (last10) otpMemoryCache.set(last10, { hash, expiresAt, phone: identifier });
};

export const findUserByIdentifier = async (identifier: string, options?: { includeEnrollments?: boolean }) => {
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
        return null;
    }

    const trimmed = identifier.trim();
    const includes = {
        studentProfile: true,
        trainerProfile: true,
        ...(options?.includeEnrollments ? {
            enrollments: {
                include: {
                    course: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        } : {}),
    };

    if (trimmed.includes("@")) {
        return prisma.user.findFirst({
            where: { email: trimmed.toLowerCase() },
            include: includes,
        });
    }

    const digits = trimmed.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    const phoneVariants = Array.from(
        new Set([
            trimmed,
            digits,
            `+${digits}`,
            last10,
            `91${last10}`,
            `+91${last10}`,
            `0${last10}`,
        ].filter(Boolean))
    );

    return prisma.user.findFirst({
        where: {
            OR: [
                ...phoneVariants.map((p) => ({ phone: p })),
                ...(last10.length === 10 ? [{ phone: { endsWith: last10 } }] : []),
            ],
        },
        include: includes,
    });
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

    let user = await findUserByIdentifier(trimmed, { includeEnrollments: true });

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

    const user = await findUserByIdentifier(identifier);

    if (!user) {
        throw new Error("User not found");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store hash of 6-digit OTP code in DB
    const resetTokenHash = await bcrypt.hash(otpCode, 10);
    const resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetTokenHash,
            resetPasswordExpiresAt,
        },
    });

    // Also store in memory cache for instant matching
    const targetKey = (user.phone || user.email || identifier).trim().toLowerCase();
    otpMemoryCache.set(targetKey, {
        hash: resetTokenHash,
        expiresAt: resetPasswordExpiresAt.getTime(),
        phone: user.phone || undefined,
        email: user.email || undefined,
    });
    if (user.phone) {
        const last10 = user.phone.replace(/\D/g, "").slice(-10);
        if (last10) otpMemoryCache.set(last10, { hash: resetTokenHash, expiresAt: resetPasswordExpiresAt.getTime() });
    }

    // Send WhatsApp OTP via ZoePact template 401355
    let whatsappResult = null;
    const phoneToSend = user.phone || identifier;
    if (phoneToSend && !phoneToSend.includes("@")) {
        whatsappResult = await sendWhatsAppOTP(phoneToSend, otpCode);
    }

    return {
        message: "OTP has been sent to your WhatsApp. Please check your WhatsApp and enter the 6-digit code to verify.",
        phone: user.phone,
        email: user.email,
        whatsappSent: whatsappResult?.success ?? false,
    };
};

/* =========================================================
   VERIFY OTP (MANUALLY ENTERED BY USER)
========================================================= */

export const verifyOtp = async (data: { phone?: string; email?: string; otp: string | number }) => {
    const { phone, email, otp } = data;

    if (otp === undefined || otp === null || String(otp).trim() === "") {
        throw new Error("OTP code is required");
    }

    const cleanOtp = String(otp).replace(/\s+/g, "").trim();
    const identifier = phone || email;

    // 1. Check User in database
    if (identifier) {
        const user = await findUserByIdentifier(identifier);

        if (user && user.resetPasswordToken && user.resetPasswordExpiresAt) {
            if (user.resetPasswordExpiresAt.getTime() + 60000 < Date.now()) {
                throw new Error("OTP code has expired. Please request a new OTP.");
            }

            let isValid = false;
            if (user.resetPasswordToken.startsWith("$2b$") || user.resetPasswordToken.startsWith("$2a$")) {
                isValid = await bcrypt.compare(cleanOtp, user.resetPasswordToken);
            } else {
                isValid = user.resetPasswordToken === cleanOtp;
            }

            if (isValid) {
                return {
                    verified: true,
                    message: "OTP verified successfully",
                    phone: user.phone,
                    email: user.email,
                };
            }
        }
    }

    // 2. Check in-memory cache
    if (identifier) {
        const trimmed = identifier.trim().toLowerCase();
        const digits = trimmed.replace(/\D/g, "");
        const last10 = digits.slice(-10);

        const keysToTest = [trimmed, digits, last10].filter(Boolean);
        for (const k of keysToTest) {
            const cached = otpMemoryCache.get(k);
            if (cached) {
                if (cached.expiresAt + 60000 < Date.now()) {
                    otpMemoryCache.delete(k);
                    throw new Error("OTP code has expired. Please request a new OTP.");
                }
                const isValid = await bcrypt.compare(cleanOtp, cached.hash);
                if (isValid) {
                    return {
                        verified: true,
                        message: "OTP verified successfully",
                        phone: cached.phone || phone,
                        email: cached.email || email,
                    };
                }
            }
        }
    }

    // 3. Fallback: Search all recent active users with valid reset tokens
    const recentUsers = await prisma.user.findMany({
        where: {
            resetPasswordExpiresAt: {
                gt: new Date(Date.now() - 60000), // grace period of 1 minute
            },
            resetPasswordToken: {
                not: null,
            },
        },
    });

    for (const u of recentUsers) {
        if (u.resetPasswordToken) {
            let isValid = false;
            if (u.resetPasswordToken.startsWith("$2b$") || u.resetPasswordToken.startsWith("$2a$")) {
                isValid = await bcrypt.compare(cleanOtp, u.resetPasswordToken);
            } else {
                isValid = u.resetPasswordToken === cleanOtp;
            }

            if (isValid) {
                return {
                    verified: true,
                    message: "OTP verified successfully",
                    phone: u.phone,
                    email: u.email,
                };
            }
        }
    }

    throw new Error("Invalid or expired OTP code. Please check the 6-digit code received on WhatsApp.");
};

/* =========================================================
   RESET PASSWORD
========================================================= */

interface ResetPasswordData {
    token: string | number;
    newPassword: string;
    phone?: string;
    email?: string;
}

export const resetPassword = async (data: ResetPasswordData) => {
    const { token, newPassword, phone, email } = data;

    if (token === undefined || token === null || String(token).trim() === "") {
        throw new Error("Reset OTP code is required");
    }

    const cleanToken = String(token).replace(/\s+/g, "").trim();

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    let matchedUser = null;
    const identifier = phone || email;

    if (identifier) {
        const user = await findUserByIdentifier(identifier);

        if (user && user.resetPasswordToken && user.resetPasswordExpiresAt) {
            if (user.resetPasswordExpiresAt.getTime() + 60000 < Date.now()) {
                throw new Error("Reset token has expired. Please request a new OTP.");
            }

            let isTokenValid = false;
            if (user.resetPasswordToken.startsWith("$2b$") || user.resetPasswordToken.startsWith("$2a$")) {
                isTokenValid = await bcrypt.compare(cleanToken, user.resetPasswordToken);
            } else {
                isTokenValid = user.resetPasswordToken === cleanToken;
            }

            if (isTokenValid) {
                matchedUser = user;
            }
        }
    }

    // Fallback: Check all active users if identifier didn't match directly
    if (!matchedUser) {
        const activeUsers = await prisma.user.findMany({
            where: {
                resetPasswordExpiresAt: {
                    gt: new Date(Date.now() - 60000),
                },
                resetPasswordToken: {
                    not: null,
                },
            },
        });

        for (const user of activeUsers) {
            if (user.resetPasswordToken) {
                let isTokenValid = false;
                if (user.resetPasswordToken.startsWith("$2b$") || user.resetPasswordToken.startsWith("$2a$")) {
                    isTokenValid = await bcrypt.compare(cleanToken, user.resetPasswordToken);
                } else {
                    isTokenValid = user.resetPasswordToken === cleanToken;
                }

                if (isTokenValid) {
                    matchedUser = user;
                    break;
                }
            }
        }
    }

    if (!matchedUser) {
        throw new Error("Invalid or expired reset token");
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

    // Clear from memory cache if present
    if (matchedUser.phone) {
        otpMemoryCache.delete(matchedUser.phone);
        const last10 = matchedUser.phone.replace(/\D/g, "").slice(-10);
        if (last10) otpMemoryCache.delete(last10);
    }
    if (matchedUser.email) {
        otpMemoryCache.delete(matchedUser.email.toLowerCase());
    }

    return {
        message: "Password reset successful. You can now log in with your new password.",
    };
};