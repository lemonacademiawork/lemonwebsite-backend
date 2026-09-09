import { prisma } from "../config/database";
import {
    UserRole,
    EnrollmentStatus,
    EnrollmentSource,
    GalleryStatus,
    PaymentStatus,
} from "@prisma/client";
import { extractNameFromEmail } from "./auth.service";

export const getAdminDashboard = async () => {
    const [
        totalUsers,
        totalStudents,
        totalTrainers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        activeEnrollments,
        pendingGalleryCount,
        revenueData,
        recentOrders,
        recentEnrollments,
        recentUsers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.STUDENT } }),
        prisma.user.count({ where: { role: UserRole.TRAINER } }),
        prisma.course.count(),
        prisma.course.count({ where: { isPublished: true } }),
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { status: EnrollmentStatus.ACTIVE } }),
        prisma.gallerySubmission.count({ where: { status: GalleryStatus.PENDING } }),
        prisma.payment.aggregate({
            where: { status: PaymentStatus.CAPTURED },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        studentProfile: { select: { name: true, avatarUrl: true } },
                    },
                },
                course: { select: { id: true, title: true } },
            },
        }),
        prisma.enrollment.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        studentProfile: { select: { name: true, avatarUrl: true } },
                    },
                },
                course: { select: { id: true, title: true } },
            },
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                studentProfile: { select: { name: true, avatarUrl: true } },
            },
        }),
    ]);

    const formattedRecentUsers = recentUsers.map((u) => {
        const studentName =
            (u.studentProfile?.name && u.studentProfile.name.trim().toLowerCase() !== "student" ? u.studentProfile.name.trim() : null) ||
            (u.name && u.name.trim().toLowerCase() !== "student" ? u.name.trim() : null) ||
            extractNameFromEmail(u.email);

        return {
            ...u,
            name: studentName,
        };
    });

    const formattedRecentOrders = recentOrders.map((o) => {
        const studentName =
            (o.student?.studentProfile?.name && o.student.studentProfile.name.trim().toLowerCase() !== "student" ? o.student.studentProfile.name.trim() : null) ||
            (o.student?.name && o.student.name.trim().toLowerCase() !== "student" ? o.student.name.trim() : null) ||
            extractNameFromEmail(o.student?.email);

        return {
            ...o,
            student: o.student
                ? {
                    ...o.student,
                    name: studentName,
                }
                : o.student,
        };
    });

    const formattedRecentEnrollments = recentEnrollments.map((e) => {
        const studentName =
            (e.student?.studentProfile?.name && e.student.studentProfile.name.trim().toLowerCase() !== "student" ? e.student.studentProfile.name.trim() : null) ||
            (e.student?.name && e.student.name.trim().toLowerCase() !== "student" ? e.student.name.trim() : null) ||
            extractNameFromEmail(e.student?.email);

        return {
            ...e,
            student: e.student
                ? {
                    ...e.student,
                    name: studentName,
                }
                : e.student,
        };
    });

    return {
        stats: {
            totalUsers,
            totalStudents,
            totalTrainers,
            totalCourses,
            publishedCourses,
            totalEnrollments,
            activeEnrollments,
            pendingGallerySubmissions: pendingGalleryCount,
            totalRevenue: revenueData._sum.amount ? Number(revenueData._sum.amount) : 0,
            totalCapturedPayments: revenueData._count,
        },
        recentOrders: formattedRecentOrders,
        recentEnrollments: formattedRecentEnrollments,
        recentUsers: formattedRecentUsers,
    };
};

export const getAdminUsers = async (query: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
        where.role = query.role;
    }

    if (query.isActive !== undefined) {
        where.isActive = query.isActive;
    }

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
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
                trainerProfile: true,
                _count: {
                    select: {
                        enrollments: true,
                        coursesTaught: true,
                        orders: true,
                    },
                },
            },
        }),
    ]);

    const formattedUsers = users.map((u) => {
        const studentName =
            (u.studentProfile?.name && u.studentProfile.name.trim().toLowerCase() !== "student" ? u.studentProfile.name.trim() : null) ||
            (u.name && u.name.trim().toLowerCase() !== "student" ? u.name.trim() : null) ||
            (u.trainerProfile?.name && u.trainerProfile.name.trim().toLowerCase() !== "trainer" ? u.trainerProfile.name.trim() : null) ||
            extractNameFromEmail(u.email);

        return {
            ...u,
            name: studentName,
            studentProfile: u.studentProfile
                ? {
                    ...u.studentProfile,
                    name: studentName,
                }
                : u.studentProfile,
        };
    });

    return {
        users: formattedUsers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getAdminUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            trainerProfile: true,
            enrollments: {
                include: {
                    course: {
                        select: { id: true, title: true, slug: true },
                    },
                },
            },
            coursesTaught: {
                select: { id: true, title: true, slug: true, isPublished: true, price: true },
            },
            orders: {
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    course: { select: { id: true, title: true } },
                    payment: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const updateUserRole = async (userId: string, role: UserRole) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            trainerProfile: true,
            studentProfile: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // If changing to TRAINER and profile doesn't exist, create it
    if (role === UserRole.TRAINER && !user.trainerProfile) {
        await prisma.trainerProfile.create({
            data: {
                user: { connect: { id: userId } },
                name: user.name || "Trainer",
                phone: user.phone,
            },
        });
    }

    // If changing to STUDENT and profile doesn't exist, create it
    if (role === UserRole.STUDENT && !user.studentProfile) {
        await prisma.studentProfile.create({
            data: {
                userId,
                name: user.name || "Student",
                phone: user.phone,
            },
        });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

export const getAdminEnrollments = async (query: {
    courseId?: string;
    studentId?: string;
    status?: EnrollmentStatus;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.courseId) where.courseId = query.courseId;
    if (query.studentId) where.studentId = query.studentId;
    if (query.status) where.status = query.status;

    const [total, enrollments] = await Promise.all([
        prisma.enrollment.count({ where }),
        prisma.enrollment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { enrolledAt: "desc" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        studentProfile: { select: { name: true, phone: true, avatarUrl: true } },
                    },
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                    },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        amount: true,
                        status: true,
                    },
                },
            },
        }),
    ]);

    const formattedEnrollments = enrollments.map((e) => {
        const studentName =
            (e.student?.studentProfile?.name && e.student.studentProfile.name.trim().toLowerCase() !== "student" ? e.student.studentProfile.name.trim() : null) ||
            (e.student?.name && e.student.name.trim().toLowerCase() !== "student" ? e.student.name.trim() : null) ||
            extractNameFromEmail(e.student?.email);

        return {
            ...e,
            student: e.student
                ? {
                    ...e.student,
                    name: studentName,
                }
                : e.student,
        };
    });

    return {
        enrollments: formattedEnrollments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const createManualEnrollment = async (data: {
    studentId: string;
    courseId: string;
}) => {
    const student = await prisma.user.findUnique({
        where: { id: data.studentId },
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const course = await prisma.course.findUnique({
        where: { id: data.courseId },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: data.studentId,
                courseId: data.courseId,
            },
        },
    });

    if (existingEnrollment) {
        if (existingEnrollment.status !== EnrollmentStatus.ACTIVE) {
            return await prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    status: EnrollmentStatus.ACTIVE,
                    source: EnrollmentSource.ADMIN_MANUAL,
                },
                include: { student: true, course: true },
            });
        }
        throw new Error("Student is already actively enrolled in this course");
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            studentId: data.studentId,
            courseId: data.courseId,
            source: EnrollmentSource.ADMIN_MANUAL,
            status: EnrollmentStatus.ACTIVE,
        },
        include: {
            student: { select: { id: true, name: true, phone: true, email: true } },
            course: { select: { id: true, title: true } },
        },
    });

    return enrollment;
};

export const updateEnrollmentStatus = async (
    enrollmentId: string,
    status: EnrollmentStatus
) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
    });

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    const updated = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status },
        include: {
            student: { select: { id: true, name: true, phone: true, email: true } },
            course: { select: { id: true, title: true } },
        },
    });

    return updated;
};

export const getAdminGallerySubmissions = async (query: {
    status?: GalleryStatus;
    isFeatured?: boolean;
    courseId?: string;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.courseId) where.courseId = query.courseId;

    const [total, submissions] = await Promise.all([
        prisma.gallerySubmission.count({ where }),
        prisma.gallerySubmission.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        studentProfile: { select: { avatarUrl: true } },
                    },
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
                moderator: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
        }),
    ]);

    return {
        submissions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const moderateGallerySubmission = async (
    submissionId: string,
    moderatorId: string,
    data: {
        status: GalleryStatus;
        adminFeedback?: string;
        isFeatured?: boolean;
    }
) => {
    const submission = await prisma.gallerySubmission.findUnique({
        where: { id: submissionId },
        include: {
            student: { select: { id: true, name: true, phone: true, email: true } },
            course: { select: { id: true, title: true, trainerId: true } },
        },
    });

    if (!submission) {
        throw new Error("Gallery submission not found");
    }

    const updated = await prisma.gallerySubmission.update({
        where: { id: submissionId },
        data: {
            status: data.status,
            adminFeedback: data.adminFeedback,
            ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
            moderatedBy: moderatorId,
            moderatedAt: new Date(),
        },
        include: {
            student: { select: { id: true, name: true, phone: true, email: true } },
            course: { select: { id: true, title: true, trainerId: true } },
            moderator: { select: { id: true, name: true, phone: true } },
        },
    });

    if (data.status === "REJECTED") {
        const feedbackText = data.adminFeedback?.trim()
            ? ` Feedback: "${data.adminFeedback.trim()}"`
            : "";

        const notificationsToCreate: Array<{
            userId: string;
            title: string;
            message: string;
            type: string;
        }> = [
            {
                userId: submission.studentId,
                title: "Artwork Submission Rejected",
                message: `Your artwork "${submission.title}" for course "${submission.course?.title || "Course"}" was not approved by admin.${feedbackText}`,
                type: "GALLERY_REJECTED",
            },
        ];

        if (submission.course?.trainerId && submission.course.trainerId !== submission.studentId) {
            const studentName = submission.student?.name || "A student";
            notificationsToCreate.push({
                userId: submission.course.trainerId,
                title: "Student Artwork Rejected",
                message: `Artwork "${submission.title}" submitted by ${studentName} for course "${submission.course?.title || "Course"}" was rejected by admin.${feedbackText}`,
                type: "GALLERY_REJECTED",
            });
        }

        await prisma.notification.createMany({
            data: notificationsToCreate,
        });
    }

    return updated;
};



export const getAdminSystemSettings = async () => {
    const settings = await prisma.systemSetting.findMany({
        orderBy: { settingKey: "asc" },
    });
    return settings;
};

export const upsertSystemSetting = async (data: {
    settingKey: string;
    settingValue: string;
    description?: string;
}) => {
    const setting = await prisma.systemSetting.upsert({
        where: { settingKey: data.settingKey },
        update: {
            settingValue: data.settingValue,
            ...(data.description !== undefined && { description: data.description }),
        },
        create: {
            settingKey: data.settingKey,
            settingValue: data.settingValue,
            description: data.description,
        },
    });

    return setting;
};
