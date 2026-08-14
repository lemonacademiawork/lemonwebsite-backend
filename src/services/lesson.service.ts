import { prisma } from "../config/database";

interface CreateLessonData {
    title: string;
    description?: string;
    videoProvider?: string;
    videoId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    fileSizeBytes?: bigint;
    orderIndex?: number;
    isPreview?: boolean;
}

export const createLesson = async (
    moduleId: string,
    trainerId: string,
    data: CreateLessonData
) => {
    // Check module exists
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

    // Check trainer owns the course
    if (module.course.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to add lessons to this module"
        );
    }

    const lesson = await prisma.lesson.create({
        data: {
            moduleId,
            title: data.title,
            description: data.description,
            videoProvider: data.videoProvider ?? "CLOUDINARY",
            videoId: data.videoId,
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
            durationSeconds: data.durationSeconds ?? 0,
            fileSizeBytes: data.fileSizeBytes ?? BigInt(0),
            orderIndex: data.orderIndex ?? 1,
            isPreview: data.isPreview ?? false,
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
    data: UpdateLessonData
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

    if (module.course.trainerId !== trainerId) {
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
    trainerId: string
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

    if (module.course.trainerId !== trainerId) {
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
    trainerId: string
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

    if (module.course.trainerId !== trainerId) {
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