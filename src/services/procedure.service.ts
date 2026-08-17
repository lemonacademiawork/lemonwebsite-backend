import { prisma } from "../config/database";

interface CreateProcedureData {
    title: string;
    contentText: string;
    orderIndex?: number;
    lessonId?: string;
}

export const createProcedure = async (
    courseId: string,
    trainerId: string,
    data: CreateProcedureData
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
            "You are not allowed to add procedures to this course"
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

    const procedure = await prisma.procedure.create({
        data: {
            courseId,
            lessonId: data.lessonId,
            title: data.title,
            contentText: data.contentText,
            orderIndex: data.orderIndex ?? 1,
        },
    });

    return procedure;
};

export const getProcedures = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const procedures = await prisma.procedure.findMany({
        where: {
            courseId,
        },
        orderBy: {
            orderIndex: "asc",
        },
        include: {
            lesson: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    return procedures;
};
interface UpdateProcedureData {
    title?: string;
    contentText?: string;
    orderIndex?: number;
    lessonId?: string;
}

export const updateProcedure = async (
    courseId: string,
    procedureId: string,
    trainerId: string,
    data: UpdateProcedureData
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
            "You are not allowed to update procedures in this course"
        );
    }

    const procedure = await prisma.procedure.findFirst({
        where: {
            id: procedureId,
            courseId,
        },
    });

    if (!procedure) {
        throw new Error("Procedure not found");
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

    const updatedProcedure = await prisma.procedure.update({
        where: {
            id: procedureId,
        },
        data: {
            ...(data.title !== undefined && {
                title: data.title,
            }),

            ...(data.contentText !== undefined && {
                contentText: data.contentText,
            }),

            ...(data.orderIndex !== undefined && {
                orderIndex: data.orderIndex,
            }),

            ...(data.lessonId !== undefined && {
                lessonId: data.lessonId,
            }),
        },
    });

    return updatedProcedure;
};
export const deleteProcedure = async (
    courseId: string,
    procedureId: string,
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
            "You are not allowed to delete procedures from this course"
        );
    }

    const procedure = await prisma.procedure.findFirst({
        where: {
            id: procedureId,
            courseId,
        },
    });

    if (!procedure) {
        throw new Error("Procedure not found");
    }

    await prisma.procedure.delete({
        where: {
            id: procedureId,
        },
    });

    return {
        message: "Procedure deleted successfully",
    };
};