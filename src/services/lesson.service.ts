import { prisma } from "../config/database";

interface CreateLessonData {
    title: string;
    description?: string | null;
    videoProvider?: string;
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string | null;
    durationSeconds?: number;
    fileSizeBytes?: bigint | number;
    orderIndex?: number;
    isPreview?: boolean;
    isPublished?: boolean;
}

export const createLesson = async (
    moduleId: string,
    trainerId: string,
    data: CreateLessonData,
    userRole?: string
) => {
    // 1. Verify parent Module exists before inserting (prevents FK lock hang)
    const module = await prisma.courseModule.findUnique({
        where: {
            id: moduleId,
        },
        include: {
            course: true,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    // 2. Check trainer owns the course or user is ADMIN
    if (userRole !== "ADMIN" && module.course?.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to add lessons to this module"
        );
    }

    // 3. Resilient orderIndex calculation to avoid unique constraint deadlock / conflicts
    let finalOrderIndex =
        data.orderIndex !== undefined && !isNaN(Number(data.orderIndex))
            ? Number(data.orderIndex)
            : undefined;

    if (finalOrderIndex === undefined) {
        const lastLesson = await prisma.lesson.findFirst({
            where: { moduleId },
            orderBy: { orderIndex: "desc" },
            select: { orderIndex: true },
        });
        finalOrderIndex = (lastLesson?.orderIndex ?? 0) + 1;
    } else {
        const existing = await prisma.lesson.findUnique({
            where: {
                moduleId_orderIndex: {
                    moduleId,
                    orderIndex: finalOrderIndex,
                },
            },
        });
        if (existing) {
            const lastLesson = await prisma.lesson.findFirst({
                where: { moduleId },
                orderBy: { orderIndex: "desc" },
                select: { orderIndex: true },
            });
            finalOrderIndex = (lastLesson?.orderIndex ?? 0) + 1;
        }
    }

    // 4. Create the lesson (Sanitize numbers, booleans, and defaults)
    const lesson = await prisma.lesson.create({
        data: {
            moduleId,
            title: data.title.trim(),
            description: data.description ? data.description.trim() : null,
            videoProvider: data.videoProvider || "CLOUDINARY",
            videoId: data.videoId || `v_${Date.now()}`,
            videoUrl: data.videoUrl || "",
            thumbnailUrl: data.thumbnailUrl || null,
            durationSeconds: Number(data.durationSeconds) || 0,
            fileSizeBytes:
                data.fileSizeBytes !== undefined && data.fileSizeBytes !== null
                    ? BigInt(data.fileSizeBytes)
                    : BigInt(0),
            orderIndex: finalOrderIndex,
            isPreview: Boolean(data.isPreview),
            isPublished:
                data.isPublished !== undefined
                    ? Boolean(data.isPublished)
                    : true,
        },
    });

    return lesson;
};
export const getLessons = async (moduleId: string) => {
    const module = await prisma.courseModule.findUnique({
        where: {
            id: moduleId,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    const lessons = await prisma.lesson.findMany({
        where: {
            moduleId,
        },
        orderBy: {
            orderIndex: "asc",
        },
    });

    return lessons;
};
interface UpdateLessonData {
    title?: string;
    description?: string;
    videoProvider?: string;
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    fileSizeBytes?: bigint;
    orderIndex?: number;
    isPreview?: boolean;
    isPublished?: boolean;
}

export const updateLesson = async (
    moduleId: string,
    lessonId: string,
    trainerId: string,
    data: UpdateLessonData,
    userRole?: string
) => {
    const module = await prisma.courseModule.findUnique({
        where: {
            id: moduleId,
        },
        include: {
            course: true,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    if (userRole !== "ADMIN" && module.course?.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to update lessons in this module"
        );
    }

    const lesson = await prisma.lesson.findFirst({
        where: {
            id: lessonId,
            moduleId,
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    const updatedLesson = await prisma.lesson.update({
        where: {
            id: lessonId,
        },
        data: {
            ...(data.title !== undefined && {
                title: data.title,
            }),

            ...(data.description !== undefined && {
                description: data.description,
            }),

            ...(data.videoProvider !== undefined && {
                videoProvider: data.videoProvider,
            }),

            ...(data.videoId !== undefined && {
                videoId: data.videoId,
            }),

            ...(data.videoUrl !== undefined && {
                videoUrl: data.videoUrl,
            }),

            ...(data.thumbnailUrl !== undefined && {
                thumbnailUrl: data.thumbnailUrl,
            }),

            ...(data.durationSeconds !== undefined && {
                durationSeconds: data.durationSeconds,
            }),

            ...(data.fileSizeBytes !== undefined && {
                fileSizeBytes: data.fileSizeBytes,
            }),

            ...(data.orderIndex !== undefined && {
                orderIndex: data.orderIndex,
            }),

            ...(data.isPreview !== undefined && {
                isPreview: data.isPreview,
            }),

            ...(data.isPublished !== undefined && {
                isPublished: data.isPublished,
            }),
        },
    });

    return updatedLesson;
};
export const deleteLesson = async (
    moduleId: string,
    lessonId: string,
    trainerId: string,
    userRole?: string
) => {
    const module = await prisma.courseModule.findUnique({
        where: {
            id: moduleId,
        },
        include: {
            course: true,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    if (userRole !== "ADMIN" && module.course?.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to delete lessons from this module"
        );
    }

    const lesson = await prisma.lesson.findFirst({
        where: {
            id: lessonId,
            moduleId,
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Delete progress for this lesson
    await prisma.progress.deleteMany({
        where: {
            lessonId,
        },
    });

    // Delete procedures for this lesson
    await prisma.procedure.deleteMany({
        where: {
            lessonId,
        },
    });

    // Delete the lesson
    await prisma.lesson.delete({
        where: {
            id: lessonId,
        },
    });

    return {
        message: "Lesson deleted successfully",
    };
};
export const toggleLessonPublish = async (
    moduleId: string,
    lessonId: string,
    trainerId: string,
    userRole?: string
) => {
    const module = await prisma.courseModule.findUnique({
        where: {
            id: moduleId,
        },
        include: {
            course: true,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    if (userRole !== "ADMIN" && module.course?.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to publish this lesson"
        );
    }

    const lesson = await prisma.lesson.findFirst({
        where: {
            id: lessonId,
            moduleId,
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    const updatedLesson = await prisma.lesson.update({
        where: {
            id: lessonId,
        },
        data: {
            isPublished: !lesson.isPublished,
        },
    });

    return updatedLesson;
};