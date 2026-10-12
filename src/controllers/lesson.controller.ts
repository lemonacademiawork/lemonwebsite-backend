import { Request, Response } from "express";
import { createLesson as createLessonService, getLessons, updateLesson, deleteLesson, toggleLessonPublish } from "../services/lesson.service";

export const createLessonController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { moduleId } = req.params;

        // 1. Validate required inputs immediately
        if (!moduleId || !moduleId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Module ID is required in URL parameter",
            });
        }

        const {
            title,
            description = "",
            videoProvider = "CLOUDINARY",
            videoId = "",
            videoUrl = "",
            thumbnailUrl = "",
            durationSeconds = 0,
            fileSizeBytes = 0,
            orderIndex,
            isPreview = false,
            isPublished = true,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Lesson title is required",
            });
        }

        // 2. Create the lesson via service (handles parent module existence, role checks, and resilient orderIndex)
        const lesson = await createLessonService(
            moduleId.trim(),
            req.user.userId,
            {
                title: title.trim(),
                description: description ? description.trim() : null,
                videoProvider: videoProvider || "CLOUDINARY",
                videoId: videoId || `v_${Date.now()}`,
                videoUrl: videoUrl || "",
                thumbnailUrl: thumbnailUrl || null,
                durationSeconds: Number(durationSeconds) || 0,
                fileSizeBytes: Number(fileSizeBytes) || 0,
                orderIndex:
                    orderIndex !== undefined && !isNaN(Number(orderIndex))
                        ? Number(orderIndex)
                        : undefined,
                isPreview: Boolean(isPreview),
                isPublished:
                    isPublished !== undefined
                        ? Boolean(isPublished)
                        : true,
            },
            req.user.role
        );

        // 4. MUST send response back to client
        return res.status(201).json({
            success: true,
            message: "Lesson created successfully",
            data: {
                ...lesson,
                fileSizeBytes: lesson.fileSizeBytes?.toString(),
            },
        });
    } catch (error) {
        console.error("Error creating lesson:", error);
        const message =
            error instanceof Error
                ? error.message
                : "Internal server error creating lesson";

        if (message === "Course module not found") {
            return res.status(404).json({
                success: false,
                message: `Module with id "${req.params.moduleId}" not found`,
            });
        }

        if (
            message ===
            "You are not allowed to add lessons to this module"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        // 5. CRITICAL: Never let error block Express request pipeline
        return res.status(500).json({
            success: false,
            message: message || "Internal server error creating lesson",
            error: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : error) : undefined,
        });
    }
};

// Also export alias createLesson for controller compatibility
export const createLesson = createLessonController;
export const getLessonsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { moduleId } = req.params;

        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "Module ID is required",
            });
        }

        const lessons = await getLessons(moduleId);

        return res.status(200).json({
            success: true,
            message: "Lessons retrieved successfully",
            data: lessons.map((lesson) => ({
                ...lesson,
                fileSizeBytes:
                    lesson.fileSizeBytes?.toString(),
            })),
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve lessons";

        if (message === "Course module not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get lessons error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve lessons",
        });
    }
};
export const updateLessonController = async (
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

        const { moduleId, lessonId } = req.params;

        if (!moduleId || !lessonId) {
            return res.status(400).json({
                success: false,
                message: "Module ID and Lesson ID are required",
            });
        }

        const {
            title,
            description,
            videoProvider,
            videoId,
            videoUrl,
            thumbnailUrl,
            durationSeconds,
            fileSizeBytes,
            orderIndex,
            isPreview,
            isPublished,
        } = req.body;

        const updatedLesson = await updateLesson(
            moduleId,
            lessonId,
            req.user.userId,
            {
                title,
                description,
                videoProvider,
                videoId,
                videoUrl,
                thumbnailUrl,

                durationSeconds:
                    durationSeconds !== undefined
                        ? Number(durationSeconds)
                        : undefined,

                fileSizeBytes:
                    fileSizeBytes !== undefined
                        ? BigInt(fileSizeBytes)
                        : undefined,

                orderIndex:
                    orderIndex !== undefined
                        ? Number(orderIndex)
                        : undefined,

                isPreview,
                isPublished,
            },
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: "Lesson updated successfully",
            data: {
                ...updatedLesson,
                fileSizeBytes:
                    updatedLesson.fileSizeBytes?.toString(),
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update lesson";

        if (
            message === "Course module not found" ||
            message === "Lesson not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update lessons in this module"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Update lesson error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update lesson",
        });
    }
};
export const deleteLessonController = async (
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

        const { moduleId, lessonId } = req.params;

        if (!moduleId || !lessonId) {
            return res.status(400).json({
                success: false,
                message: "Module ID and Lesson ID are required",
            });
        }

        const result = await deleteLesson(
            moduleId,
            lessonId,
            req.user.userId,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete lesson";

        if (
            message === "Course module not found" ||
            message === "Lesson not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete lessons from this module"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete lesson error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete lesson",
        });
    }
};
export const toggleLessonPublishController = async (
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

        const { moduleId, lessonId } = req.params;

        if (!moduleId || !lessonId) {
            return res.status(400).json({
                success: false,
                message: "Module ID and Lesson ID are required",
            });
        }

        const lesson = await toggleLessonPublish(
            moduleId,
            lessonId,
            req.user.userId,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: lesson.isPublished
                ? "Lesson published successfully"
                : "Lesson unpublished successfully",
            data: {
                ...lesson,
                fileSizeBytes:
                    lesson.fileSizeBytes?.toString(),
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update lesson publish status";

        if (
            message === "Course module not found" ||
            message === "Lesson not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to publish this lesson"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Toggle lesson publish error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update lesson publish status",
        });
    }
};