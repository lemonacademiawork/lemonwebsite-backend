import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt";
import crypto from "crypto";
import { prisma } from "../config/database";

interface RegisterData {
    name: string;
    email: string;
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
        email,
        password,
    } = data;

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
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
            name,
            email,
            passwordHash: hashedPassword,

            studentProfile: {
                create: {
                    name,
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
    email: string,
    password: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            studentProfile: true,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
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
     *
     * This handles an existing email/password
     * account that is now logging in with Google.
     */
    if (!user) {
        user = await prisma.user.findUnique({
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

        /*
         * Your current Prisma schema requires
         * passwordHash, so we generate a random
         * password hash that the Google user
         * doesn't know.
         */
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

/* =========================================================
   LOGOUT
========================================================= */

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