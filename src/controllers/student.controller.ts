import { Request, Response } from "express";
import { getMyProfile, updateMyProfile, getMyEnrollments, getMyPayments, getMyDashboard, getMyProgress, updateMyProgress, getMyNotifications } from "../services/student.service";
import { getMyCertificates } from "../services/certificate.service";
export const getMyProfileController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await getMyProfile(userId);

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch profile";

        if (message === "User not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get my profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });

    }
}; export const updateMyProfileController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { name, phone, avatarUrl, bio } = req.body;

        const profile = await updateMyProfile(userId, {
            name,
            phone,
            avatarUrl,
            bio,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update profile";

        if (message === "Student profile not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Update my profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
export const getMyEnrollmentsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const enrollments = await getMyEnrollments(userId);

        return res.status(200).json({
            success: true,
            message: "Enrollments fetched successfully",
            data: enrollments,
        });
    } catch (error) {
        console.error("Get my enrollments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
        });
    }
};
export const getMyPaymentsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const payments = await getMyPayments(userId);

        return res.status(200).json({
            success: true,
            message: "Payments fetched successfully",
            data: payments,
        });
    } catch (error) {
        console.error("Get my payments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
        });
    }
};
export const getMyDashboardController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const dashboard = await getMyDashboard(userId);

        return res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully",
            data: dashboard,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch dashboard";

        if (message === "Student profile not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get student dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard",
        });
    }
};
export const getMyProgressController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const progress = await getMyProgress(userId);

        return res.status(200).json({
            success: true,
            message: "Progress fetched successfully",
            data: progress,
        });
    } catch (error) {
        console.error("Get my progress error:", error);

        return res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch progress",
        });
    }
};
export const updateMyProgressController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { lessonId } = req.params;
        const { watchedSeconds, isCompleted } = req.body;

        const progress = await updateMyProgress(
            userId,
            lessonId,
            {
                watchedSeconds,
                isCompleted,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            data: progress,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update progress";

        if (
            message === "Lesson not found" ||
            message === "You are not enrolled in this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Update my progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update progress",
        });
    }
};
export const getMyCertificatesController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const certificates = await getMyCertificates(userId);

        return res.status(200).json({
            success: true,
            message: "Certificates fetched successfully",
            data: certificates,
        });
    } catch (error) {
        console.error("Get my certificates error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch certificates",
        });
    }
};