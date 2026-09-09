import { Request, Response } from "express";
import { getCurrentUser, updateCurrentUser, changePassword } from "../services/user.service";
import { getMyNotifications, markNotificationAsRead } from "../services/student.service";

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
            email,
            bio,
            avatarUrl,
        } = req.body;

        const updatedProfile = await updateCurrentUser(
            req.user.userId,
            {
                name,
                phone,
                email,
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
export const changePasswordController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        await changePassword(
            req.user.userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to change password";

        if (message === "User not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (message === "Current password is incorrect") {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to change password",
        });
    }
};

export const getMyNotificationsController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const notifications = await getMyNotifications(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications,
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch notifications",
        });
    }
};

export const markNotificationAsReadController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { notificationId } = req.params;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required",
            });
        }

        const notification = await markNotificationAsRead(
            req.user.userId,
            notificationId
        );

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to mark notification as read";

        if (message === "Notification not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Mark notification as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};