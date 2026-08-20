import { Request, Response } from "express";

import {
    createBusinessGuidance,
    getBusinessGuidance,
    updateBusinessGuidance,
    deleteBusinessGuidance, toggleBusinessGuidancePublish
} from "../services/businessGuidance.service";


// ==============================
// CREATE BUSINESS GUIDANCE
// ==============================

export const createBusinessGuidanceController = async (
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

        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const {
            title,
            contentType,
            description,
            resourceUrl,
            meetingTime,
            orderIndex,
            isPublished,
            moduleId,
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        const guidance = await createBusinessGuidance(
            courseId,
            req.user.userId,
            {
                title,
                contentType,
                description,
                resourceUrl,
                meetingTime: meetingTime
                    ? new Date(meetingTime)
                    : undefined,
                orderIndex,
                isPublished,
                moduleId,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Business guidance created successfully",
            data: guidance,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create business guidance";

        if (
            message === "Course not found" ||
            message ===
            "Module not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to add business guidance to this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Create business guidance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create business guidance",
        });
    }
};


// ==============================
// GET BUSINESS GUIDANCE
// ==============================

export const getBusinessGuidanceController = async (
    req: Request,
    res: Response
) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const guidance = await getBusinessGuidance(courseId);

        return res.status(200).json({
            success: true,
            message: "Business guidance fetched successfully",
            data: guidance,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch business guidance";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get business guidance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch business guidance",
        });
    }
};


// ==============================
// UPDATE BUSINESS GUIDANCE
// ==============================

export const updateBusinessGuidanceController = async (
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

        const { courseId, guidanceId } = req.params;

        if (!courseId || !guidanceId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Guidance ID are required",
            });
        }

        const {
            title,
            contentType,
            description,
            resourceUrl,
            meetingTime,
            orderIndex,
            isPublished,
            moduleId,
        } = req.body;

        const updatedGuidance = await updateBusinessGuidance(
            courseId,
            guidanceId,
            req.user.userId,
            {
                title,
                contentType,
                description,
                resourceUrl,
                meetingTime:
                    meetingTime !== undefined
                        ? meetingTime
                            ? new Date(meetingTime)
                            : null
                        : undefined,
                orderIndex,
                isPublished,
                moduleId,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Business guidance updated successfully",
            data: updatedGuidance,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update business guidance";

        if (
            message === "Course not found" ||
            message === "Business guidance not found" ||
            message ===
            "Module not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update business guidance in this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Update business guidance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update business guidance",
        });
    }
};


// ==============================
// DELETE BUSINESS GUIDANCE
// ==============================

export const deleteBusinessGuidanceController = async (
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

        const { courseId, guidanceId } = req.params;

        if (!courseId || !guidanceId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Guidance ID are required",
            });
        }

        const result = await deleteBusinessGuidance(
            courseId,
            guidanceId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete business guidance";

        if (
            message === "Course not found" ||
            message === "Business guidance not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete business guidance from this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete business guidance error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete business guidance",
        });
    }
};
export const toggleBusinessGuidancePublishController = async (
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

        const { courseId, guidanceId } = req.params;

        if (!courseId || !guidanceId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Guidance ID are required",
            });
        }

        const { isPublished } = req.body;

        if (typeof isPublished !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isPublished must be a boolean",
            });
        }

        const updatedGuidance =
            await toggleBusinessGuidancePublish(
                courseId,
                guidanceId,
                req.user.userId,
                isPublished
            );

        return res.status(200).json({
            success: true,
            message: isPublished
                ? "Business guidance published successfully"
                : "Business guidance unpublished successfully",
            data: updatedGuidance,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update business guidance status";

        if (
            message === "Course not found" ||
            message === "Business guidance not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to publish business guidance in this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error(
            "Toggle business guidance publish error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update business guidance status",
        });
    }
};