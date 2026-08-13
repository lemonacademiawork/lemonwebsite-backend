import { Request, Response } from "express";
import { getCurrentUser, updateCurrentUser } from "../services/user.service";

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
export const updateMe = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            name,
            phone,
            bio,
            avatarUrl,
        } = req.body;

        const updatedProfile = await updateCurrentUser(
            req.user.userId,
            {
                name,
                phone,
                bio,
                avatarUrl,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update profile";

        const statusCode =
            message === "User not found" ||
                message === "Student profile not found"
                ? 404
                : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
