import { prisma } from "../config/database";

export const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            studentProfile: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};
export const updateMyProfile = async (
    userId: string,
    data: {
        name?: string;
        phone?: string | null;
        avatarUrl?: string | null;
        bio?: string | null;
    }
) => {
    const profile = await prisma.studentProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!profile) {
        throw new Error("Student profile not found");
    }

    if (data.phone) {
        const trimmedPhone = data.phone.trim();
        const existing = await prisma.user.findFirst({
            where: {
                phone: trimmedPhone,
                NOT: { id: userId },
            },
        });
        if (existing) {
            throw new Error("Phone number is already in use by another account");
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                phone: trimmedPhone,
                ...(data.name !== undefined && { name: data.name }),
            },
        });
    } else if (data.name !== undefined) {
        await prisma.user.update({
            where: { id: userId },
            data: { name: data.name },
        });
    }

    const updatedProfile = await prisma.studentProfile.update({
        where: {
            userId,
        },
        data: {
            name: data.name,
            phone: data.phone ? data.phone.trim() : data.phone,
            avatarUrl: data.avatarUrl,
            bio: data.bio,
        },
    });

    return updatedProfile;
};
export const getMyEnrollments = async (userId: string) => {
    const enrollments = await prisma.enrollment.findMany({
        where: {
            studentId: userId,
        },
        include: {
            course: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return enrollments;
};

export const getMyPayments = async (userId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            studentId: userId,
        },
        include: {
            order: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return payments;
};
export const getMyDashboard = async (userId: string) => {
    const [profile, enrollments, payments] = await Promise.all([
        prisma.studentProfile.findUnique({
            where: {
                userId,
            },
        }),

        prisma.enrollment.findMany({
            where: {
                studentId: userId,
            },
            include: {
                course: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.payment.findMany({
            where: {
                studentId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    if (!profile) {
        throw new Error("Student profile not found");
    }

    return {
        profile,
        totalEnrollments: enrollments.length,
        totalPayments: payments.length,
        enrollments: enrollments.slice(0, 5),
        payments: payments.slice(0, 5),
    };
};
export const getMyProgress = async (userId: string) => {
    const progress = await prisma.progress.findMany({
        where: {
            studentId: userId
        },
        include: {
            course: true,
            lesson: true,
        },
        orderBy: {
            updatedAt: "desc"
        },
    });
    return progress;
};
interface UpdateProgressData {
    watchedSeconds?: number;
    isCompleted?: boolean;
}

export const updateMyProgress = async (
    userId: string,
    lessonId: string,
    data: UpdateProgressData
) => {
    // Check lesson and get its course
    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
        include: {
            module: true,
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    const courseId = lesson.module.courseId;

    // Check whether student is enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId: userId,
            courseId,
        },
    });

    if (!enrollment) {
        throw new Error("You are not enrolled in this course");
    }

    const progress = await prisma.progress.upsert({
        where: {
            studentId_lessonId: {
                studentId: userId,
                lessonId,
            },
        },
        update: {
            watchedSeconds: data.watchedSeconds,
            isCompleted: data.isCompleted,
            completedAt: data.isCompleted ? new Date() : null,
        },
        create: {
            studentId: userId,
            courseId,
            lessonId,
            watchedSeconds: data.watchedSeconds ?? 0,
            isCompleted: data.isCompleted ?? false,
            completedAt: data.isCompleted ? new Date() : null,
        },
        include: {
            course: true,
            lesson: true,
        },
    });

    return progress;
};
export { getMyCertificates } from "./certificate.service";
export const getMyNotifications = async (userId: string) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications;
};
export const markNotificationAsRead = async (
    userId: string,
    notificationId: string
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return updatedNotification;
};