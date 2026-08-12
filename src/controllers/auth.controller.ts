import { Request, Response } from "express";
import { registerUser, loginUser, refreshUser, logoutUser, } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Registration failed",
        });
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Login failed",
        });
    }
};
export const getMe = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Authenticated user",
        data: {
            user: req.user,
        },
    });
};
export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const result = await refreshUser(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Invalid or expired refresh token",
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        await logoutUser(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Logout failed",
        });
    }
};