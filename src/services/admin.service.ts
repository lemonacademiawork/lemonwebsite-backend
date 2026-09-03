import { prisma } from "../config/database";
import {
    UserRole,
    EnrollmentStatus,
    EnrollmentSource,
    GalleryStatus,
    CommissionStatus,
    PaymentStatus,
} from "@prisma/client";

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
        pendingCommissionCount,
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
        prisma.referralCommission.count({ where: { status: CommissionStatus.PENDING } }),
        prisma.payment.aggregate({
            where: { status: PaymentStatus.CAPTURED },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true } },
            },
        }),
        prisma.enrollment.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true } },
            },
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        }),
    ]);

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
            pendingCommissions: pendingCommissionCount,
            totalRevenue: revenueData._sum.amount ? Number(revenueData._sum.amount) : 0,
            totalCapturedPayments: revenueData._count,
        },
        recentOrders,
        recentEnrollments,
        recentUsers,
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

    return {
        users,
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
            },
        });
    }

    // If changing to STUDENT and profile doesn't exist, create it
    if (role === UserRole.STUDENT && !user.studentProfile) {
        const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.studentProfile.create({
            data: {
                userId,
                name: user.name || "Student",
                referralCode,
            },
        });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            name: true,
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
                        email: true,
                        studentProfile: { select: { phone: true, avatarUrl: true } },
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

    return {
        enrollments,
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
            student: { select: { id: true, name: true, email: true } },
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
            student: { select: { id: true, name: true, email: true } },
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
            student: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, title: true } },
            moderator: { select: { id: true, name: true } },
        },
    });

    return updated;
};

export const getAdminCommissions = async (query: {
    status?: CommissionStatus;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [total, commissions] = await Promise.all([
        prisma.referralCommission.count({ where }),
        prisma.referralCommission.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                referrer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentProfile: { select: { referralCode: true, phone: true } },
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
                referral: {
                    select: {
                        id: true,
                        referralCodeUsed: true,
                        referred: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        }),
    ]);

    return {
        commissions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateCommissionStatus = async (
    commissionId: string,
    data: {
        status: CommissionStatus;
        transactionReference?: string;
    }
) => {
    const commission = await prisma.referralCommission.findUnique({
        where: { id: commissionId },
    });

    if (!commission) {
        throw new Error("Referral commission not found");
    }

    const updated = await prisma.referralCommission.update({
        where: { id: commissionId },
        data: {
            status: data.status,
            transactionReference: data.transactionReference,
            payoutDate: data.status === CommissionStatus.PAID ? new Date() : undefined,
        },
        include: {
            referrer: { select: { id: true, name: true, email: true } },
            order: { select: { orderNumber: true, amount: true } },
        },
    });

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
