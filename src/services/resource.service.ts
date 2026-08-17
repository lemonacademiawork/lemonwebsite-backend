import { prisma } from "../config/database";

interface CreateResourceData {
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize?: bigint;
    lessonId?: string;
    procedureId?: string;
}

export const createResource = async (
    courseId: string,
    trainerId: string,
    data: CreateResourceData
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
            "You are not allowed to add resources to this course"
        );
    }

    if (data.lessonId) {
        const lesson = await prisma.lesson.findFirst({
            where: {
                id: data.lessonId,
                module: {
                    courseId,
                },
            },
        });

        if (!lesson) {
            throw new Error(
                "Lesson not found or does not belong to this course"
            );
        }
    }

    if (data.procedureId) {
        const procedure = await prisma.procedure.findFirst({
            where: {
                id: data.procedureId,
                courseId,
            },
        });

        if (!procedure) {
            throw new Error(
                "Procedure not found or does not belong to this course"
            );
        }
    }

    const resource = await prisma.resource.create({
        data: {
            courseId,
            lessonId: data.lessonId,
            procedureId: data.procedureId,
            title: data.title,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize ?? BigInt(0),
        },
    });

    return resource;
};
export const getResources = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const resources = await prisma.resource.findMany({
        where: {
            courseId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            lesson: {
                select: {
                    id: true,
                    title: true,
                },
            },
            procedure: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    return resources;
};
interface UpdateResourceData {
    title?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: bigint;
    lessonId?: string | null;
    procedureId?: string | null;
}

export const updateResource = async (
    courseId: string,
    resourceId: string,
    trainerId: string,
    data: UpdateResourceData
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
            "You are not allowed to update resources in this course"
        );
    }

    const resource = await prisma.resource.findFirst({
        where: {
            id: resourceId,
            courseId,
        },
    });

    if (!resource) {
        throw new Error("Resource not found");
    }

    if (data.lessonId) {
        const lesson = await prisma.lesson.findFirst({
            where: {
                id: data.lessonId,
                module: {
                    courseId,
                },
            },
        });

        if (!lesson) {
            throw new Error(
                "Lesson not found or does not belong to this course"
            );
        }
    }

    if (data.procedureId) {
        const procedure = await prisma.procedure.findFirst({
            where: {
                id: data.procedureId,
                courseId,
            },
        });

        if (!procedure) {
            throw new Error(
                "Procedure not found or does not belong to this course"
            );
        }
    }

    const updatedResource = await prisma.resource.update({
        where: {
            id: resourceId,
        },
        data: {
            ...(data.title !== undefined && {
                title: data.title,
            }),

            ...(data.fileUrl !== undefined && {
                fileUrl: data.fileUrl,
            }),

            ...(data.fileType !== undefined && {
                fileType: data.fileType,
            }),

            ...(data.fileSize !== undefined && {
                fileSize: data.fileSize,
            }),

            ...(data.lessonId !== undefined && {
                lessonId: data.lessonId,
            }),

            ...(data.procedureId !== undefined && {
                procedureId: data.procedureId,
            }),
        },
    });

    return updatedResource;
};