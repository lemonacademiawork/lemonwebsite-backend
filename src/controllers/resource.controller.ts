import { Request, Response } from "express";

import {
    createResource,
    getResources,
    updateResource, deleteResource
} from "../services/resource.service";

export const createResourceController = async (
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
            fileUrl,
            fileType,
            fileSize,
            lessonId,
            procedureId,
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Resource title is required",
            });
        }

        if (!fileUrl) {
            return res.status(400).json({
                success: false,
                message: "File URL is required",
            });
        }

        if (!fileType) {
            return res.status(400).json({
                success: false,
                message: "File type is required",
            });
        }

        const resource = await createResource(
            courseId,
            req.user.userId,
            {
                title,
                fileUrl,
                fileType,
                fileSize:
                    fileSize !== undefined
                        ? BigInt(fileSize)
                        : undefined,
                lessonId,
                procedureId,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Resource created successfully",
            data: {
                ...resource,
                fileSize:
                    resource.fileSize?.toString(),
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create resource";

        if (
            message === "Course not found" ||
            message ===
            "Lesson not found or does not belong to this course" ||
            message ===
            "Procedure not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to add resources to this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Create resource error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create resource",
        });
    }
};

export const getResourcesController = async (
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

        const resources = await getResources(courseId);

        return res.status(200).json({
            success: true,
            message: "Resources retrieved successfully",
            data: resources.map((resource) => ({
                ...resource,
                fileSize:
                    resource.fileSize?.toString(),
            })),
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve resources";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get resources error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve resources",
        });
    }
};

export const updateResourceController = async (
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

        const { courseId, resourceId } = req.params;

        if (!courseId || !resourceId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Resource ID are required",
            });
        }

        const {
            title,
            fileUrl,
            fileType,
            fileSize,
            lessonId,
            procedureId,
        } = req.body;

        const updatedResource = await updateResource(
            courseId,
            resourceId,
            req.user.userId,
            {
                title,
                fileUrl,
                fileType,
                fileSize:
                    fileSize !== undefined
                        ? BigInt(fileSize)
                        : undefined,
                lessonId,
                procedureId,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Resource updated successfully",
            data: {
                ...updatedResource,
                fileSize:
                    updatedResource.fileSize?.toString(),
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update resource";

        if (
            message === "Course not found" ||
            message === "Resource not found" ||
            message ===
            "Lesson not found or does not belong to this course" ||
            message ===
            "Procedure not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update resources in this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Update resource error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update resource",
        });
    }
};
export const deleteResourceController = async (
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

        const { courseId, resourceId } = req.params;

        if (!courseId || !resourceId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Resource ID are required",
            });
        }

        const result = await deleteResource(
            courseId,
            resourceId,
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
                : "Failed to delete resource";

        if (
            message === "Course not found" ||
            message === "Resource not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete resources from this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete resource error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete resource",
        });
    }
};