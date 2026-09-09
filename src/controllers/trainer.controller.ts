import { Request, Response } from "express";

import {
    getMyTrainerProfile,
    updateMyTrainerProfile,
    getMyTrainerCourses,
    getMyTrainerDashboard,
    getMyTrainerStudents,
    getMyTrainerReviews,
    getMyTrainerGallerySubmissions,
    updateTrainerGalleryFeedback,
} from "../services/trainer.service";

export const getMyTrainerProfileController = async (
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

        const trainer = await getMyTrainerProfile(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer profile fetched successfully",
            data: trainer,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateMyTrainerProfileController = async (
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

        const trainer = await updateMyTrainerProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Trainer profile updated successfully",
            data: trainer,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyTrainerCoursesController = async (
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

        const courses = await getMyTrainerCourses(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer courses fetched successfully",
            data: courses,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyTrainerDashboardController = async (
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

        const dashboard = await getMyTrainerDashboard(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer dashboard fetched successfully",
            data: dashboard,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyTrainerStudentsController = async (
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

        const students = await getMyTrainerStudents(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer students fetched successfully",
            data: students,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyTrainerReviewsController = async (
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

        const reviews = await getMyTrainerReviews(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer course reviews fetched successfully",
            data: reviews,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyTrainerGallerySubmissionsController = async (
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

        const submissions = await getMyTrainerGallerySubmissions(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Trainer gallery submissions fetched successfully",
            data: submissions,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateTrainerGalleryFeedbackController = async (
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
        const { feedback } = req.body;

        if (!feedback) {
            return res.status(400).json({
                success: false,
                message: "Feedback is required",
            });
        }

        const updated = await updateTrainerGalleryFeedback(
            req.user.userId,
            id,
            feedback
        );

        return res.status(200).json({
            success: true,
            message: "Feedback submitted successfully",
            data: updated,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};