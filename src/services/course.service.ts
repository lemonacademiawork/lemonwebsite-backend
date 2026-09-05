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

export const getCourseContent = async (
    courseId: string,
    studentId: string
) => {
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
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
                        include: {
                            procedures: {
                                orderBy: {
                                    orderIndex: "asc",
                                },
                            },
                            resources: true,
                        },
                    },
                    businessGuidance: {
                        where: {
                            isPublished: true,
                        },
                        orderBy: {
                            orderIndex: "asc",
                        },
                    },
                },
            },
            procedures: {
                orderBy: {
                    orderIndex: "asc",
                },
            },
            resources: true,
            businessGuidance: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    orderIndex: "asc",
                },
            },
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const [progress, enrollment] = await Promise.all([
        prisma.progress.findMany({
            where: {
                studentId,
                courseId,
            },
        }),
        prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId,
            },
            select: {
                id: true,
                status: true,
                source: true,
                enrolledAt: true,
            },
        }),
    ]);

    return {
        ...course,
        enrollment,
        progress,
    };
};

export const getCourseBySlug = async (slug: string) => {
    const course = await prisma.course.findUnique({
        where: {
            slug,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

export const getCourseEnrollmentStatus = async (
    courseId: string,
    studentId: string
) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            id: true,
            title: true,
            slug: true,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId,
        },
        select: {
            id: true,
            status: true,
            source: true,
            enrolledAt: true,
            createdAt: true,
        },
    });

    return {
        courseId: course.id,
        courseTitle: course.title,
        enrolled: !!enrollment && enrollment.status === "ACTIVE",
        enrollment: enrollment || null,
    };
};

export const getCourseProgress = async (
    courseId: string,
    studentId: string
) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            id: true,
            title: true,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const [totalLessons, completedProgressList, allProgress, enrollment] =
        await Promise.all([
            prisma.lesson.count({
                where: {
                    module: {
                        courseId,
                        isPublished: true,
                    },
                    isPublished: true,
                },
            }),
            prisma.progress.findMany({
                where: {
                    studentId,
                    courseId,
                    isCompleted: true,
                },
            }),
            prisma.progress.findMany({
                where: {
                    studentId,
                    courseId,
                },
                include: {
                    lesson: {
                        select: {
                            id: true,
                            title: true,
                            orderIndex: true,
                            durationSeconds: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
            }),
            prisma.enrollment.findFirst({
                where: {
                    studentId,
                    courseId,
                },
                select: {
                    id: true,
                    status: true,
                    enrolledAt: true,
                },
            }),
        ]);

    const completedLessons = completedProgressList.length;
    const progressPercentage =
        totalLessons > 0
            ? Math.min(
                  100,
                  Math.round((completedLessons / totalLessons) * 100)
              )
            : 0;
    const isCompleted =
        totalLessons > 0 && completedLessons >= totalLessons;

    return {
        courseId: course.id,
        courseTitle: course.title,
        totalLessons,
        completedLessons,
        progressPercentage,
        isCompleted,
        enrollment: enrollment || null,
        progress: allProgress,
    };
};

interface ReorderModuleItem {
    id: string;
    orderIndex?: number;
    order?: number;
}

export const reorderCourseModules = async (
    courseId: string,
    userId: string,
    userRole: string,
    modules: ReorderModuleItem[]
) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    if (userRole !== "ADMIN" && course.trainerId !== userId) {
        throw new Error("You are not allowed to manage modules for this course");
    }

    if (!Array.isArray(modules) || modules.length === 0) {
        throw new Error("Modules array is required and must not be empty");
    }

    const moduleIds = modules.map((m) => m.id);
    if (new Set(moduleIds).size !== moduleIds.length) {
        throw new Error("Duplicate module IDs found in reorder list");
    }

    const orderIndices = modules.map((m) => {
        const val = m.orderIndex ?? m.order;
        if (typeof val !== "number" || val <= 0) {
            throw new Error(`Invalid orderIndex for module ${m.id}`);
        }
        return val;
    });

    if (new Set(orderIndices).size !== orderIndices.length) {
        throw new Error("Duplicate order positions found in reorder list");
    }

    const existingModules = await prisma.courseModule.findMany({
        where: {
            id: { in: moduleIds },
            courseId,
        },
    });

    if (existingModules.length !== moduleIds.length) {
        throw new Error("One or more modules do not belong to this course");
    }

    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < modules.length; i++) {
            await tx.courseModule.update({
                where: { id: modules[i].id },
                data: { orderIndex: -1 * (i + 1000) },
            });
        }

        for (const item of modules) {
            const targetIndex = item.orderIndex ?? item.order;
            await tx.courseModule.update({
                where: { id: item.id },
                data: { orderIndex: targetIndex },
            });
        }
    });

    const updatedModules = await prisma.courseModule.findMany({
        where: { courseId },
        orderBy: { orderIndex: "asc" },
        include: {
            lessons: {
                orderBy: { orderIndex: "asc" },
            },
        },
    });

    return updatedModules;
};

interface ReorderLessonItem {
    id: string;
    orderIndex?: number;
    order?: number;
    moduleId?: string;
}

export const reorderCourseLessons = async (
    courseId: string,
    userId: string,
    userRole: string,
    lessons: ReorderLessonItem[]
) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    if (userRole !== "ADMIN" && course.trainerId !== userId) {
        throw new Error("You are not allowed to manage lessons for this course");
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
        throw new Error("Lessons array is required and must not be empty");
    }

    const lessonIds = lessons.map((l) => l.id);
    if (new Set(lessonIds).size !== lessonIds.length) {
        throw new Error("Duplicate lesson IDs found in reorder list");
    }

    const existingLessons = await prisma.lesson.findMany({
        where: {
            id: { in: lessonIds },
            module: {
                courseId,
            },
        },
        include: {
            module: true,
        },
    });

    if (existingLessons.length !== lessonIds.length) {
        throw new Error("One or more lessons do not belong to this course");
    }

    const lessonsByModule: {
        [moduleId: string]: { id: string; orderIndex: number }[];
    } = {};

    for (const item of lessons) {
        const targetIndex = item.orderIndex ?? item.order;
        if (typeof targetIndex !== "number" || targetIndex <= 0) {
            throw new Error(`Invalid orderIndex for lesson ${item.id}`);
        }

        const existing = existingLessons.find((l) => l.id === item.id);
        const targetModuleId = item.moduleId || existing?.moduleId;

        if (targetModuleId) {
            if (!lessonsByModule[targetModuleId]) {
                lessonsByModule[targetModuleId] = [];
            }
            lessonsByModule[targetModuleId].push({
                id: item.id,
                orderIndex: targetIndex,
            });
        }
    }

    for (const modId in lessonsByModule) {
        const indices = lessonsByModule[modId].map((l) => l.orderIndex);
        if (new Set(indices).size !== indices.length) {
            throw new Error(
                "Duplicate lesson order positions found within the same module"
            );
        }
    }

    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < lessons.length; i++) {
            await tx.lesson.update({
                where: { id: lessons[i].id },
                data: { orderIndex: -1 * (i + 1000) },
            });
        }

        for (const item of lessons) {
            const targetIndex = item.orderIndex ?? item.order;
            await tx.lesson.update({
                where: { id: item.id },
                data: {
                    orderIndex: targetIndex,
                    ...(item.moduleId ? { moduleId: item.moduleId } : {}),
                },
            });
        }
    });

    const updatedModules = await prisma.courseModule.findMany({
        where: { courseId },
        orderBy: { orderIndex: "asc" },
        include: {
            lessons: {
                orderBy: { orderIndex: "asc" },
            },
        },
    });

    return updatedModules;
};