import { prisma } from "../config/database";
import { BusinessGuidanceType } from "@prisma/client";

interface CreateBusinessGuidanceData {
    title: string;
    contentType?: BusinessGuidanceType;
    description?: string;
    resourceUrl?: string;
    meetingTime?: Date;
    orderIndex?: number;
    isPublished?: boolean;
    moduleId?: string;
}

export const createBusinessGuidance = async (
    courseId: string,
    trainerId: string,
    data: CreateBusinessGuidanceData
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
            "You are not allowed to add business guidance to this course"
        );
    }

    if (data.moduleId) {
        const module = await prisma.courseModule.findFirst({
            where: {
                id: data.moduleId,
                courseId,
            },
        });

        if (!module) {
            throw new Error(
                "Module not found or does not belong to this course"
            );
        }
    }

    const guidance = await prisma.businessGuidance.create({
        data: {
            courseId,
            trainerId,
            moduleId: data.moduleId,
            title: data.title,
            contentType: data.contentType,
            description: data.description,
            resourceUrl: data.resourceUrl,
            meetingTime: data.meetingTime,
            orderIndex: data.orderIndex ?? 1,
            isPublished: data.isPublished ?? true,
        },
    });

    return guidance;
};

export const getBusinessGuidance = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });
    if (!course) {
        throw new Error("Course Not Found");
    }

    const guidance = await prisma.businessGuidance.findMany({
        where: {
            courseId,
        },
        orderBy: {
            orderIndex: "asc",
        },
        include: {
            module: {
                select: {
                    id: true,
                    title: true,
                },
            },
            trainer: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    return guidance;
};

interface UpdateBusinessGuidanceData {
    title?: string;
    contentType?: BusinessGuidanceType;
    description?: string | null;
    resourceUrl?: string | null;
    meetingTime?: Date | null;
    orderIndex?: number;
    isPublished?: boolean;
    moduleId?: string | null;
}

export const updateBusinessGuidance = async (
    courseId: string,
    guidanceId: string,
    trainerId: string,
    data: UpdateBusinessGuidanceData
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
            "You are not allowed to update business guidance in this course"
        );
    }

    const guidance = await prisma.businessGuidance.findFirst({
        where: {
            id: guidanceId,
            courseId,
        },
    });

    if (!guidance) {
        throw new Error("Business guidance not found");
    }

    if (data.moduleId) {
        const module = await prisma.courseModule.findFirst({
            where: {
                id: data.moduleId,
                courseId,
            },
        });

        if (!module) {
            throw new Error(
                "Module not found or does not belong to this course"
            );
        }
    }

    const updatedGuidance =
        await prisma.businessGuidance.update({
            where: {
                id: guidanceId,
            },
            data: {
                ...(data.title !== undefined && {
                    title: data.title,
                }),

                ...(data.contentType !== undefined && {
                    contentType: data.contentType,
                }),

                ...(data.description !== undefined && {
                    description: data.description,
                }),

                ...(data.resourceUrl !== undefined && {
                    resourceUrl: data.resourceUrl,
                }),

                ...(data.meetingTime !== undefined && {
                    meetingTime: data.meetingTime,
                }),

                ...(data.orderIndex !== undefined && {
                    orderIndex: data.orderIndex,
                }),

                ...(data.isPublished !== undefined && {
                    isPublished: data.isPublished,
                }),

                ...(data.moduleId !== undefined && {
                    moduleId: data.moduleId,
                }),
            },
        });

    return updatedGuidance;
};
export const deleteBusinessGuidance = async (
    courseId: string,
    guidanceId: string,
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
            "You are not allowed to delete business guidance from this course"
        );
    }

    const guidance = await prisma.businessGuidance.findFirst({
        where: {
            id: guidanceId,
            courseId,
        },
    });

    if (!guidance) {
        throw new Error("Business guidance not found");
    }

    await prisma.businessGuidance.delete({
        where: {
            id: guidanceId,
        },
    });

    return {
        message: "Business guidance deleted successfully",
    };
};
export const toggleBusinessGuidancePublish = async (
    courseId: string,
    guidanceId: string,
    trainerId: string,
    isPublished: boolean
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
            "You are not allowed to publish business guidance in this course"
        );
    }

    const guidance = await prisma.businessGuidance.findFirst({
        where: {
            id: guidanceId,
            courseId,
        },
    });

    if (!guidance) {
        throw new Error("Business guidance not found");
    }

    const updatedGuidance =
        await prisma.businessGuidance.update({
            where: {
                id: guidanceId,
            },
            data: {
                isPublished,
            },
        });

    return updatedGuidance;
};