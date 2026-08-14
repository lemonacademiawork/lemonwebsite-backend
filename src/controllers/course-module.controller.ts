import { Request, Response } from "express";
import { createCourseModule, getCourseModules, updateCourseModule, deleteCourseModule, toggleCourseModulePublish } from "../services/course-module.service";

export const createCourseModuleController = async (
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
        const { title, description, orderIndex } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Module title is required",
            });
        }

        const module = await createCourseModule(
            courseId,
            req.user.userId,
            {
                title,
                description,
                orderIndex:
                    orderIndex !== undefined
                        ? Number(orderIndex)
                        : undefined,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Course module created successfully",
            data: module,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create course module";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to add modules to this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Create course module error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create course module",
        });
    }
};
export const getCourseModulesController = async (
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

        const modules = await getCourseModules(courseId);

        return res.status(200).json({
            success: true,
            message: "Course modules retrieved successfully",
            data: modules,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve course modules";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get course modules error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve course modules",
        });
    }
};
export const updateCourseModuleController = async (
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

        const { courseId, moduleId } = req.params;

        if (!courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Module ID are required",
            });
        }

        const {
            title,
            description,
            orderIndex,
            isPublished,
        } = req.body;

        const updatedModule = await updateCourseModule(
            courseId,
            moduleId,
            req.user.userId,
            {
                title,
                description,
                orderIndex:
                    orderIndex !== undefined
                        ? Number(orderIndex)
                        : undefined,
                isPublished,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Course module updated successfully",
            data: updatedModule,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update course module";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (message === "Course module not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update modules in this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Update course module error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update course module",
        });
    }
};
export const deleteCourseModuleController = async (
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

        const { courseId, moduleId } = req.params;

        if (!courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Module ID are required",
            });
        }

        const result = await deleteCourseModule(
            courseId,
            moduleId,
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
                : "Failed to delete course module";

        if (
            message === "Course not found" ||
            message === "Course module not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete modules from this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete course module error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete course module",
        });
    }
};
export const toggleCourseModulePublishController = async (
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

        const { courseId, moduleId } = req.params;

        if (!courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Module ID are required",
            });
        }

        const module = await toggleCourseModulePublish(
            courseId,
            moduleId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: module.isPublished
                ? "Course module published successfully"
                : "Course module unpublished successfully",
            data: module,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update module publish status";

        if (
            message === "Course not found" ||
            message === "Course module not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to publish this module"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Toggle module publish error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update module publish status",
        });
    }
};