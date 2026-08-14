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