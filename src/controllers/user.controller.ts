import { Request, Response } from "express";
import { getCurrentUser } from "../services/user.service";

export const getMe = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await getCurrentUser(req.user.userId);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to get user profile";
        const statusCode = message === "User not found" ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
