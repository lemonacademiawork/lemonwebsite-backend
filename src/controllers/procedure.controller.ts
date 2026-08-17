import { Request, Response } from "express";
import { createProcedure, getProcedures, updateProcedure, deleteProcedure } from "../services/procedure.service";

export const createProcedureController = async (
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
            contentText,
            orderIndex,
            lessonId,
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Procedure title is required",
            });
        }

        if (!contentText) {
            return res.status(400).json({
                success: false,
                message: "Procedure content is required",
            });
        }

        const procedure = await createProcedure(
            courseId,
            req.user.userId,
            {
                title,
                contentText,
                orderIndex:
                    orderIndex !== undefined
                        ? Number(orderIndex)
                        : undefined,
                lessonId,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Procedure created successfully",
            data: procedure,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create procedure";

        if (
            message === "Course not found" ||
            message ===
            "Lesson not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to add procedures to this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Create procedure error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create procedure",
        });
    }
};
export const getProceduresController = async (
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
        const procedures = await getProcedures(courseId);

        return res.status(200).json({
            success: true,
            message: "Procedures retrieved successfully",
            data: procedures,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve procedures";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }
        console.error("Get procedures error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve procedures",
        });
    }
};
export const updateProcedureController = async (
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

        const { courseId, procedureId } = req.params;

        if (!courseId || !procedureId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Procedure ID are required",
            });
        }

        const {
            title,
            contentText,
            orderIndex,
            lessonId,
        } = req.body;

        const updatedProcedure = await updateProcedure(
            courseId,
            procedureId,
            req.user.userId,
            {
                title,
                contentText,
                orderIndex:
                    orderIndex !== undefined
                        ? Number(orderIndex)
                        : undefined,
                lessonId,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Procedure updated successfully",
            data: updatedProcedure,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update procedure";

        if (
            message === "Course not found" ||
            message === "Procedure not found" ||
            message ===
            "Lesson not found or does not belong to this course"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update procedures in this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Update procedure error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update procedure",
        });
    }
};
export const deleteProcedureController = async (
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

        const { courseId, procedureId } = req.params;

        if (!courseId || !procedureId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Procedure ID are required",
            });
        }

        const result = await deleteProcedure(
            courseId,
            procedureId,
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
                : "Failed to delete procedure";

        if (
            message === "Course not found" ||
            message === "Procedure not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete procedures from this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete procedure error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete procedure",
        });
    }
};