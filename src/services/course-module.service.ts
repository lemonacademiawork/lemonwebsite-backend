import { prisma } from "../config/database";

interface CreateModuleData {
    title: string;
    description?: string;
    orderIndex?: number;
}

export const createCourseModule = async (
    courseId: string,
    trainerId: string,
    data: CreateModuleData
) => {
    // Check course exists
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Only course owner can create modules
    if (course.trainerId !== trainerId) {
        throw new Error(
            "You are not allowed to add modules to this course"
        );
    }

    const module = await prisma.courseModule.create({
        data: {
            courseId,
            title: data.title,
            description: data.description,
            orderIndex: data.orderIndex ?? 1,
        },
    });

    return module;
};
export const getCourseModules = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const modules = await prisma.courseModule.findMany({
        where: {
            courseId,
        },
        orderBy: {
            orderIndex: "asc",
        },
    });

    return modules;
};
interface UpdateModuleData {
    title?: string;
    description?: string;
    orderIndex?: number;
    isPublished?: boolean;
}

export const updateCourseModule = async (
    courseId: string,
    moduleId: string,
    trainerId: string,
    data: UpdateModuleData
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
            "You are not allowed to update modules in this course"
        );
    }

    const module = await prisma.courseModule.findFirst({
        where: {
            id: moduleId,
            courseId,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    const updatedModule = await prisma.courseModule.update({
        where: {
            id: moduleId,
        },
        data: {
            ...(data.title !== undefined && {
                title: data.title,
            }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.orderIndex !== undefined && {
                orderIndex: data.orderIndex,
            }),
            ...(data.isPublished !== undefined && {
                isPublished: data.isPublished,
            }),
        },
    });

    return updatedModule;
};

export const deleteCourseModule = async (
    courseId: string,
    moduleId: string,
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
            "You are not allowed to delete modules from this course"
        );
    }


    const module = await prisma.courseModule.findFirst({
        where: {
            id: moduleId,
            courseId,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    await prisma.courseModule.delete({
        where: {
            id: moduleId,
        },
    });

    return {
        message: "Course module deleted successfully",
    };
};
export const toggleCourseModulePublish = async (
    courseId: string,
    moduleId: string,
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
            "You are not allowed to toggle publish status of modules in this course"
        );
    }


    const module = await prisma.courseModule.findFirst({
        where: {
            id: moduleId,
            courseId,
        },
    });

    if (!module) {
        throw new Error("Course module not found");
    }

    const updatedModule = await prisma.courseModule.update({
        where: {
            id: moduleId,
        },
        data: {
            isPublished: !module.isPublished,
        },
    });

    return updatedModule;
};