import { Request, Response } from "express";
import { createEnrollment, getEnrollments, getEnrollmentById } from "../services/enrollment.service";

export const createEnrollmentController = async (
    req: Request,
    res: Response
) => {
    try {
        // 1. Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2. Get data from request body
        const {
            courseId,
            orderId,
            source,
        } = req.body;

        // 3. Validate required field
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        // 4. Create enrollment
        const enrollment = await createEnrollment(
            req.user.userId,
            {
                courseId,
                orderId,
                source,
            }
        );

        // 5. Return successful response
        return res.status(201).json({
            success: true,
            message: "Enrollment created successfully",
            data: enrollment,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create enrollment";

        // Course / Order not found
        if (
            message === "Course not found" ||
            message === "Order not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        // Invalid enrollment request
        if (
            message ===
            "Student is already enrolled in this course" ||
            message === "Order is not paid" ||
            message ===
            "Order does not belong to this course"
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        // Unexpected server error
        console.error("Create enrollment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create enrollment",
        });
    }
};

export const getEnrollmentsController = async (
    req: Request,
    res: Response
) => {
    try {
        // 1. Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2. Get enrollments for logged-in student
        const enrollments = await getEnrollments(
            req.user.userId
        );

        // 3. Return response
        return res.status(200).json({
            success: true,
            data: enrollments,
        });
    } catch (error) {
        console.error("Get enrollments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
        });
    }
};
export const getEnrollmentByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        // 1. Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2. Get enrollment ID from URL
        const { enrollmentId } = req.params;

        if (!enrollmentId) {
            return res.status(400).json({
                success: false,
                message: "Enrollment ID is required",
            });
        }

        // 3. Get enrollment
        const enrollment = await getEnrollmentById(
            enrollmentId,
            req.user.userId
        );

        // 4. Return response
        return res.status(200).json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch enrollment";

        if (message === "Enrollment not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error(
            "Get enrollment by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollment",
        });
    }
};