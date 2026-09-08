import { Request, Response } from "express";
import {
    submitTrainerRequest,
    getMyTrainerRequests,
    getAllTrainerRequests,
    getTrainerRequestById,
    updateTrainerRequestStatus,
    deleteTrainerRequest,
} from "../services/trainerRequest.service";
import { TrainerRequestStatus } from "@prisma/client";

export const submitTrainerRequestController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const request = await submitTrainerRequest(req.body, userId);

        return res.status(201).json({
            success: true,
            message: "Your application to become a trainer has been submitted successfully",
            data: request,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to submit trainer application";
        return res.status(400).json({
            success: false,
            message,
        });
    }
};

export const getMyTrainerRequestsController = async (req: Request, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const requests = await getMyTrainerRequests(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer applications retrieved successfully",
            data: requests,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve trainer applications";
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getAllTrainerRequestsController = async (req: Request, res: Response) => {
    try {
        const { status, search, page, limit } = req.query;

        const result = await getAllTrainerRequests({
            status: status as TrainerRequestStatus | undefined,
            search: search as string | undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Trainer applications retrieved successfully",
            data: result.requests,
            pagination: result.pagination,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve trainer applications";
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getTrainerRequestByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const request = await getTrainerRequestById(id);

        return res.status(200).json({
            success: true,
            message: "Trainer application details retrieved successfully",
            data: request,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve trainer application";
        const statusCode = message === "Trainer application request not found" ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const updateTrainerRequestStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = req.user!.userId;
        const { status, adminNotes } = req.body;

        if (!status || !Object.values(TrainerRequestStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${Object.values(TrainerRequestStatus).join(", ")}`,
            });
        }

        const updated = await updateTrainerRequestStatus(id, adminId, {
            status,
            adminNotes,
        });

        return res.status(200).json({
            success: true,
            message: `Trainer application status updated to ${status}`,
            data: updated,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update trainer application";
        const statusCode = message === "Trainer application request not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const deleteTrainerRequestController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await deleteTrainerRequest(id);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete trainer application";
        const statusCode = message === "Trainer application request not found" ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
