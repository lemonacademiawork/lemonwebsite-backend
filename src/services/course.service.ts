import { prisma } from "../config/database";

interface CreateCourseData {
    title: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice?: number;
    thumbnailUrl?: string;
    categoryId?: string;
}

export const createCourse = async (
    data: CreateCourseData,
    trainerId: string
) => {
    const existingCourse = await prisma.course.findUnique({
        where: {
            slug: data.slug,
        },
    });

    if (existingCourse) {
        throw new Error("Course with this slug already exists");
    }

    const course = await prisma.course.create({
        data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            price: data.price,
            discountedPrice: data.discountedPrice,
            thumbnailUrl: data.thumbnailUrl,
            categoryId: data.categoryId,
            trainerId,
        },
    });

    return course;
};
export const getAllCourses = async () => {
    const courses = await prisma.course.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            trainer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    trainerProfile: true,
                },
            },
            modules: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    orderIndex: "asc",
                },
                include: {
                    lessons: {
                        where: {
                            isPublished: true,
                        },
                        orderBy: {
                            orderIndex: "asc",
                        },
                    },
                },
            },
            procedures: true,
            resources: true,
            businessGuidance: true,
        },
    });

    return courses;
};
export const getCourseById = async (courseId: string) => {
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            isPublished: true,
        },
        include: {
            category: true,
            trainer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    trainerProfile: true,
                },
            },
            modules: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    orderIndex: "asc",
                },
                include: {
                    lessons: {
                        where: {
                            isPublished: true,
                        },
                        orderBy: {
                            orderIndex: "asc",
                        },
                    },
                },
            },
            procedures: true,
            resources: true,
            businessGuidance: true,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

interface UpdateCourseData {
    title?: string;
    slug?: string;
    description?: string;
    price?: number;
    discountedPrice?: number;
    thumbnailUrl?: string;
    categoryId?: string;
}

export const updateCourse = async (
    courseId: string,
    trainerId: string,
    data: UpdateCourseData
) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Only the trainer who owns the course can update it
    if (course.trainerId !== trainerId) {
        throw new Error("You are not allowed to update this course");
    }

    // Check slug uniqueness if slug is being changed
    if (data.slug && data.slug !== course.slug) {
        const existingCourse = await prisma.course.findUnique({
            where: {
                slug: data.slug,
            },
        });

        if (existingCourse) {
            throw new Error("Course with this slug already exists");
        }
    }

    const updatedCourse = await prisma.course.update({
        where: {
            id: courseId,
        },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.slug !== undefined && { slug: data.slug }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.discountedPrice !== undefined && {
                discountedPrice: data.discountedPrice,
            }),
            ...(data.thumbnailUrl !== undefined && {
                thumbnailUrl: data.thumbnailUrl,
            }),
            ...(data.categoryId !== undefined && {
                categoryId: data.categoryId,
            }),
        },
    });

    return updatedCourse;
};
export const deleteCourse = async (
    courseId: string,
    trainerId: string
) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Only the trainer who owns the course can delete it
    if (course.trainerId !== trainerId) {
        throw new Error("You are not allowed to delete this course");
    }

    await prisma.course.delete({
        where: {
            id: courseId,
        },
    });

    return {
        message: "Course deleted successfully",
    };
};
export const toggleCoursePublish = async (
    courseId: string,
    trainerId: string
) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    if (course.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to publish this course"
        );
    }

    const updatedCourse = await prisma.course.update({
        where: {
            id: courseId,
        },
        data: {
            isPublished: !course.isPublished,
        },
    });

    return updatedCourse;
};