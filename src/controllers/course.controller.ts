import { Request, Response } from "express";
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, toggleCoursePublish, getCourseContent } from "../services/course.service";

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

export const getCourseByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await getCourseById(id);

        return res.status(200).json({
            success: true,
            message: "Course retrieved successfully",
            data: course,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve course";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get course by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve course",
        });
    }
};
export const updateCourseController = async (
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

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
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

        const updatedCourse = await updateCourse(
            id,
            req.user.userId,
            {
                title,
                slug,
                description,
                price:
                    price !== undefined
                        ? Number(price)
                        : undefined,
                discountedPrice:
                    discountedPrice !== undefined
                        ? Number(discountedPrice)
                        : undefined,
                thumbnailUrl,
                categoryId,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update course";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to update this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "Course with this slug already exists"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Update course error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update course",
        });
    }
};
export const deleteCourseController = async (
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

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const result = await deleteCourse(
            id,
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
                : "Failed to delete course";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to delete this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Delete course error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};
export const toggleCoursePublishController = async (
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

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await toggleCoursePublish(
            id,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: course.isPublished
                ? "Course published successfully"
                : "Course unpublished successfully",
            data: course,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update course publish status";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to publish this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Toggle course publish error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update course publish status",
        });
    }
};

export const getCourseContentController = async (
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

        const courseId = req.params.courseId || req.params.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const content = await getCourseContent(
            courseId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Course content retrieved successfully",
            data: content,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve course content";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (message === "You are not enrolled in this course") {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        console.error("Get course content error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve course content",
        });
    }
};