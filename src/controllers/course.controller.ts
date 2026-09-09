import { Request, Response } from "express";
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    toggleCoursePublish,
    getCourseContent,
    getCourseBySlug,
    getCourseEnrollmentStatus,
    getCourseProgress,
    reorderCourseModules,
    reorderCourseLessons,
} from "../services/course.service";

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
            trainerId,
            isPublished,
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
                trainerId,
                isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
            },
            req.user.userId,
            req.user.role
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
        const { search, categoryId, trainerId, isPublished, page, limit } = req.query;

        const result = await getAllCourses({
            search: search ? String(search) : undefined,
            categoryId: categoryId ? String(categoryId) : undefined,
            trainerId: trainerId ? String(trainerId) : undefined,
            isPublished: isPublished !== undefined ? String(isPublished) : undefined,
            page: page !== undefined ? Number(page) : 1,
            limit: limit !== undefined ? Number(limit) : 5, // Default 5 courses per page
        });

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: result,
            courses: result.courses,
            pagination: result.pagination,
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
            trainerId,
            isPublished,
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
                trainerId,
                isPublished:
                    isPublished !== undefined
                        ? Boolean(isPublished)
                        : undefined,
            },
            req.user.role
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
            message: message || "Failed to delete course",
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
            req.user.userId,
            req.user.role
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
export const getCourseBySlugController = async (
    req: Request,
    res: Response
) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Course slug is required",
            });
        }

        const course = await getCourseBySlug(slug);

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            data: course,
        });
    } catch (error) {
        console.error("Get course by slug error:", error);

        if (
            error instanceof Error &&
            error.message === "Course not found"
        ) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course",
        });
    }
};

export const getCoursesController = getAllCoursesController;
export const publishCourseController = toggleCoursePublishController;

export const getCourseEnrollmentStatusController = async (
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

        const data = await getCourseEnrollmentStatus(
            courseId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Enrollment status retrieved successfully",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve enrollment status";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        console.error("Get course enrollment status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve enrollment status",
        });
    }
};

export const getCourseProgressController = async (
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

        const data = await getCourseProgress(
            courseId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Course progress retrieved successfully",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to retrieve course progress";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        console.error("Get course progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve course progress",
        });
    }
};

export const reorderCourseModulesController = async (
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
        const { modules } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        if (!modules || !Array.isArray(modules)) {
            return res.status(400).json({
                success: false,
                message: "Modules array is required",
            });
        }

        const updatedModules = await reorderCourseModules(
            courseId,
            req.user.userId,
            req.user.role,
            modules
        );

        return res.status(200).json({
            success: true,
            message: "Modules reordered successfully",
            data: updatedModules,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to reorder modules";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to manage modules for this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        if (
            message.includes("is required") ||
            message.includes("Duplicate") ||
            message.includes("Invalid orderIndex") ||
            message.includes("do not belong to this course")
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        console.error("Reorder course modules error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reorder modules",
        });
    }
};

export const reorderCourseLessonsController = async (
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
        const { lessons } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        if (!lessons || !Array.isArray(lessons)) {
            return res.status(400).json({
                success: false,
                message: "Lessons array is required",
            });
        }

        const updatedModules = await reorderCourseLessons(
            courseId,
            req.user.userId,
            req.user.role,
            lessons
        );

        return res.status(200).json({
            success: true,
            message: "Lessons reordered successfully",
            data: updatedModules,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to reorder lessons";

        if (message === "Course not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "You are not allowed to manage lessons for this course"
        ) {
            return res.status(403).json({
                success: false,
                message,
            });
        }

        if (
            message.includes("is required") ||
            message.includes("Duplicate") ||
            message.includes("Invalid orderIndex") ||
            message.includes("do not belong to this course")
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        console.error("Reorder course lessons error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reorder lessons",
        });
    }
};