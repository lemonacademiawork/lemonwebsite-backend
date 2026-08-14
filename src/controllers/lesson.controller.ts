import { Request, Response } from "express";
import { createLesson, getLessons, updateLesson, deleteLesson, toggleLessonPublish } from "../services/lesson.service";

export const createLessonController = async (
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

        const { moduleId } = req.params;

        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "Module ID is required",
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
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Lesson title is required",
            });
        }

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Video ID is required",
            });
        }

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: "Video URL is required",
            });
        }

        const lesson = await createLesson(
            moduleId,
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
            }
        );

        return res.status(201).json({
            success: true,
            message: "Lesson created successfully",
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
                : "Failed to create lesson";

        if (message === "Course module not found") {
            return res.status(404).json({
                success: false,
                message,
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

        console.error("Create lesson error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create lesson",
        });
    }
};
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
            }
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
            req.user.userId
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