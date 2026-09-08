import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt";
import crypto from "crypto";
import { prisma } from "../config/database";

interface RegisterData {
    name?: string;
    phone: string;
    password: string;
    email?: string;
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

    if (!phone || typeof phone !== "string" || !phone.trim()) {
        throw new Error("Phone number is required");
    }

    const trimmedPhone = phone.trim();

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { phone: trimmedPhone },
                ...(email && email.trim() ? [{ email: email.trim().toLowerCase() }] : []),
            ],
        },
    });

    if (existingUser) {
        if (existingUser.phone === trimmedPhone) {
            throw new Error("Phone number already registered");
        }
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    const referralCode =
        `LEMON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const user = await prisma.user.create({
        data: {
            name: name || "Student",
            phone: trimmedPhone,
            ...(email && email.trim() && { email: email.trim().toLowerCase() }),
            passwordHash: hashedPassword,

            studentProfile: {
                create: {
                    name: name || "Student",
                    phone: trimmedPhone,
                    referralCode,
                },
            },
        },

        include: {
            studentProfile: true,
        },
    });

    const {
        passwordHash: _passwordHash,
        ...safeUser
    } = user;

    return safeUser;
};

/* =========================================================
   LOGIN
========================================================= */

export const loginUser = async (
    phone: string,
    password: string
) => {
    if (!phone || typeof phone !== "string" || !phone.trim()) {
        throw new Error("Phone number is required");
    }

    const trimmedPhone = phone.trim();

    const user = await prisma.user.findFirst({
        where: {
            phone: trimmedPhone,
        },
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
        throw new Error("Invalid phone number or password");
    }

    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid phone number or password");
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
            },
        });
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
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (phone: string) => {
    if (!phone || typeof phone !== "string" || !phone.trim()) {
        throw new Error("Phone number is required");
    }

    const trimmedPhone = phone.trim();

    const user = await prisma.user.findFirst({
        where: {
            phone: trimmedPhone,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = await bcrypt.hash(
        resetToken,
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

    const frontendUrl = (process.env.FRONTEND_URL || "https://course-website-f.vercel.app").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&phone=${encodeURIComponent(user.phone || "")}`;

    return {
        message: "Password reset token generated successfully",
        resetToken,
        resetUrl,
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