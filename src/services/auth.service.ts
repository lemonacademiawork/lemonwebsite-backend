import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import crypto from "crypto";
import { prisma } from "../config/database";

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
}

export const registerUser = async (data: RegisterData) => {
    const { firstName, lastName, email, password } = data;

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const referralCode = `LEMON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,

            studentProfile: {
                create: {
                    firstName,
                    lastName,
                    referralCode,
                },
            },
        },

        include: {
            studentProfile: true,
        },
    });

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
};

export const loginUser = async (
    email: string,
    password: string
) => {
    // 1. Find user by email
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

    // 2. Check account status
    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(
        user.id,
        user.role
    );

    const refreshToken = generateRefreshToken(user.id);

    // 5. Hash refresh token
    const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        10
    );

    // 6. Store only the hash
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshTokenHash,
        },
    });

    // 7. Remove sensitive fields
    const {
        passwordHash: _passwordHash,
        refreshTokenHash: _refreshTokenHash,
        ...safeUser
    } = user;

    // 8. Return tokens + user
    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

export const refreshUser = async (refreshToken: string) => {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is missing from environment variables");
    }

    let decoded: RefreshTokenPayload;

    try {
        decoded = jwt.verify(refreshToken, secret) as RefreshTokenPayload;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }

    if (!decoded || typeof decoded.userId !== "string") {
        throw new Error("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });

    if (!user) {
        throw new Error("Invalid or expired refresh token");
    }

    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    if (!user.refreshTokenHash) {
        throw new Error("Invalid or expired refresh token");
    }

    const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash
    );

    if (!isRefreshTokenValid) {
        throw new Error("Invalid or expired refresh token");
    }

    const accessToken = generateAccessToken(user.id, user.role);

    return {
        accessToken,
    };
};

export const logoutUser = async (userId: string) => {
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