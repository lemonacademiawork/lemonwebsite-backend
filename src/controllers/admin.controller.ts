import { Request, Response } from "express";
import {
    getAdminDashboard,
    getAdminUsers,
    getAdminUserById,
    updateUserRole,
    updateUserStatus,
    getAdminEnrollments,
    createManualEnrollment,
    updateEnrollmentStatus,
    getAdminGallerySubmissions,
    moderateGallerySubmission,
    getAdminSystemSettings,
    upsertSystemSetting,
} from "../services/admin.service";
import {
    UserRole,
    EnrollmentStatus,
    GalleryStatus,
} from "@prisma/client";

export const getAdminDashboardController = async (
    req: Request,
    res: Response
) => {
    try {
        const dashboard = await getAdminDashboard();
        return res.status(200).json({
            success: true,
            message: "Admin dashboard metrics fetched successfully",
            data: dashboard,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch admin dashboard metrics",
        });
    }
};

export const getAdminUsersController = async (
    req: Request,
    res: Response
) => {
    try {
        const { role, isActive, search, page, limit } = req.query;

        const usersData = await getAdminUsers({
            role: role as UserRole,
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            search: search as string,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: usersData,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users",
        });
    }
};

export const getAdminUserByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const user = await getAdminUserById(id);
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message || "User not found",
        });
    }
};

export const updateUserRoleController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !Object.values(UserRole).includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Valid role is required (${Object.values(UserRole).join(", ")})`,
            });
        }

        const updatedUser = await updateUserRole(id, role);
        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: updatedUser,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update user role",
        });
    }
};

export const updateUserStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive boolean is required",
            });
        }

        const updatedUser = await updateUserStatus(id, isActive);
        return res.status(200).json({
            success: true,
            message: `User ${isActive ? "activated" : "deactivated"} successfully`,
            data: updatedUser,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update user status",
        });
    }
};

export const getAdminEnrollmentsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { courseId, studentId, status, page, limit } = req.query;

        const data = await getAdminEnrollments({
            courseId: courseId as string,
            studentId: studentId as string,
            status: status as EnrollmentStatus,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Enrollments fetched successfully",
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch enrollments",
        });
    }
};

export const createManualEnrollmentController = async (
    req: Request,
    res: Response
) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "studentId and courseId are required",
            });
        }

        const enrollment = await createManualEnrollment({ studentId, courseId });
        return res.status(201).json({
            success: true,
            message: "Manual enrollment created successfully",
            data: enrollment,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create manual enrollment",
        });
    }
};

export const updateEnrollmentStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !Object.values(EnrollmentStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Valid status is required (${Object.values(EnrollmentStatus).join(", ")})`,
            });
        }

        const updated = await updateEnrollmentStatus(id, status);
        return res.status(200).json({
            success: true,
            message: "Enrollment status updated successfully",
            data: updated,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update enrollment status",
        });
    }
};

export const getAdminGallerySubmissionsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { status, isFeatured, courseId, page, limit } = req.query;

        const data = await getAdminGallerySubmissions({
            status: status as GalleryStatus,
            isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
            courseId: courseId as string,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Gallery submissions fetched successfully",
            data,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch gallery submissions",
        });
    }
};

export const moderateGallerySubmissionController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { id } = req.params;
        const { status, adminFeedback, isFeatured } = req.body;

        if (!status || !Object.values(GalleryStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Valid status is required (${Object.values(GalleryStatus).join(", ")})`,
            });
        }

        const updated = await moderateGallerySubmission(id, req.user.userId, {
            status,
            adminFeedback,
            isFeatured,
        });

        return res.status(200).json({
            success: true,
            message: "Gallery submission moderated successfully",
            data: updated,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to moderate gallery submission",
        });
    }
};



export const getAdminSystemSettingsController = async (
    req: Request,
    res: Response
) => {
    try {
        const settings = await getAdminSystemSettings();
        return res.status(200).json({
            success: true,
            message: "System settings fetched successfully",
            data: settings,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch system settings",
        });
    }
};

export const upsertSystemSettingController = async (
    req: Request,
    res: Response
) => {
    try {
        const { settingKey, settingValue, description } = req.body;

        if (!settingKey || settingValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "settingKey and settingValue are required",
            });
        }

        const setting = await upsertSystemSetting({
            settingKey,
            settingValue,
            description,
        });

        return res.status(200).json({
            success: true,
            message: "System setting saved successfully",
            data: setting,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to save system setting",
        });
    }
};
