import { Request, Response } from "express";
import { createCourse, getAllCourses } from "../services/course.service";

export const createCourseController = async (
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

        const {
            title,
            slug,
            description,
            price,
            discountedPrice,
            thumbnailUrl,
            categoryId,
        } = req.body;

        // Basic validation
        if (!title || !slug || !description || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Title, slug, description and price are required",
            });
        }

        const course = await createCourse(
            {
                title,
                slug,
                description,
                price: Number(price),
                discountedPrice:
                    discountedPrice !== undefined
                        ? Number(discountedPrice)
                        : undefined,
                thumbnailUrl,
                categoryId,
            },
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create course";

        if (message === "Course with this slug already exists") {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getAllCoursesController = async (
    req: Request,
    res: Response
) => {
    try {
        const courses = await getAllCourses();

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: courses,
        });
    } catch (error) {
        console.error("Get all courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve courses",
        });
    }
};