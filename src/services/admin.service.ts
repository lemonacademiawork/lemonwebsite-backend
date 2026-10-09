import { prisma } from "../config/database";
import bcrypt from "bcrypt";
import {
    UserRole,
    EnrollmentStatus,
    EnrollmentSource,
    GalleryStatus,
    PaymentStatus,
    TrainerRequestStatus,
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

/* =========================================================
   ADMIN TRAINER DIRECT MANAGEMENT
========================================================= */

export interface CreateAdminTrainerInput {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    expertise?: string;
    designation?: string;
    bio?: string;
    avatarUrl?: string;
    experienceYears?: number;
}

export interface UpdateAdminTrainerInput {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    bio?: string;
    expertise?: string;
    designation?: string;
    avatarUrl?: string;
    isActive?: boolean;
}

export const createAdminTrainer = async (
    data: CreateAdminTrainerInput,
    adminId?: string
) => {
    const {
        name,
        email,
        phone,
        password,
        expertise,
        designation = "Instructor at Lemon Academy",
        bio,
        avatarUrl,
        experienceYears,
    } = data;

    if (!name || !name.trim()) {
        throw new Error("Trainer name is required");
    }

    const trimmedEmail = email && email.trim() ? email.trim().toLowerCase() : null;
    const trimmedPhone = phone && phone.trim() ? phone.trim() : null;
    const trimmedName = name.trim();

    if (!trimmedEmail && !trimmedPhone) {
        throw new Error("At least one contact method (email or phone) is required to create a trainer");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
                ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
            ],
        },
        include: {
            trainerProfile: true,
            studentProfile: true,
        },
    });

    let plainPassword = password;
    let isPasswordGenerated = false;

    if (existingUser) {
        // Prepare user updates
        const updateUserData: any = {
            isActive: true,
        };

        // If not already admin or trainer, upgrade to TRAINER
        if (existingUser.role !== UserRole.ADMIN) {
            updateUserData.role = UserRole.TRAINER;
        }

        if (password) {
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }
            updateUserData.passwordHash = await bcrypt.hash(password, 10);
        }

        if (trimmedName && (!existingUser.name || existingUser.name.toLowerCase() === "student")) {
            updateUserData.name = trimmedName;
        }

        const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: updateUserData,
        });

        // Ensure TrainerProfile exists or update it
        let trainerProfile;
        if (existingUser.trainerProfile) {
            trainerProfile = await prisma.trainerProfile.update({
                where: { userId: existingUser.id },
                data: {
                    name: trimmedName || existingUser.trainerProfile.name,
                    phone: trimmedPhone || existingUser.trainerProfile.phone,
                    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
                    ...(bio !== undefined ? { bio } : {}),
                    ...(expertise !== undefined ? { expertise } : {}),
                    ...(designation !== undefined ? { designation } : {}),
                },
            });
        } else {
            trainerProfile = await prisma.trainerProfile.create({
                data: {
                    userId: existingUser.id,
                    name: trimmedName,
                    phone: trimmedPhone,
                    avatarUrl: avatarUrl || null,
                    bio: bio || (expertise ? `Instructor specializing in ${expertise}` : "Instructor at Lemon Academy"),
                    expertise: expertise || "Artisan & Craft Instructor",
                    designation: designation || "Instructor at Lemon Academy",
                },
            });
        }

        // Also check if any pending TrainerRequest exists for this user / email / phone
        await prisma.trainerRequest.updateMany({
            where: {
                status: TrainerRequestStatus.PENDING,
                OR: [
                    { userId: existingUser.id },
                    ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
                    ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
                ],
            },
            data: {
                status: TrainerRequestStatus.APPROVED,
                reviewedBy: adminId || null,
                reviewedAt: new Date(),
                adminNotes: "Approved and provisioned directly by Admin",
                userId: existingUser.id,
            },
        });

        return {
            isNewUser: false,
            message: "Existing user upgraded to Trainer and profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt,
            },
            trainerProfile,
        };
    } else {
        // Create new user as TRAINER
        if (!plainPassword) {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            plainPassword = `Trainer@${randomCode}`;
            isPasswordGenerated = true;
        }

        if (plainPassword.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
                passwordHash,
                role: UserRole.TRAINER,
                isActive: true,
                studentProfile: {
                    create: {
                        name: trimmedName,
                        phone: trimmedPhone,
                    },
                },
                trainerProfile: {
                    create: {
                        name: trimmedName,
                        phone: trimmedPhone,
                        avatarUrl: avatarUrl || null,
                        bio: bio || (expertise ? `Instructor specializing in ${expertise}` : "Instructor at Lemon Academy"),
                        expertise: expertise || "Artisan & Craft Instructor",
                        designation: designation || "Instructor at Lemon Academy",
                    },
                },
            },
            include: {
                trainerProfile: true,
            },
        });

        // Link and approve any existing pending TrainerRequest
        await prisma.trainerRequest.updateMany({
            where: {
                status: TrainerRequestStatus.PENDING,
                OR: [
                    ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
                    ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
                ],
            },
            data: {
                status: TrainerRequestStatus.APPROVED,
                reviewedBy: adminId || null,
                reviewedAt: new Date(),
                adminNotes: "Approved and created directly by Admin",
                userId: newUser.id,
            },
        });

        return {
            isNewUser: true,
            message: "Trainer account and profile created successfully by admin",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                isActive: newUser.isActive,
                createdAt: newUser.createdAt,
            },
            trainerProfile: newUser.trainerProfile,
            credentials: {
                loginIdentifier: trimmedEmail || trimmedPhone,
                password: plainPassword,
                isPasswordGenerated,
            },
        };
    }
};

export const getAdminTrainers = async (query: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
        role: UserRole.TRAINER,
    };

    if (query.isActive !== undefined) {
        where.isActive = query.isActive;
    }

    if (query.search) {
        const searchPattern = query.search.trim();
        where.OR = [
            { name: { contains: searchPattern, mode: "insensitive" } },
            { email: { contains: searchPattern, mode: "insensitive" } },
            { phone: { contains: searchPattern, mode: "insensitive" } },
            {
                trainerProfile: {
                    OR: [
                        { name: { contains: searchPattern, mode: "insensitive" } },
                        { expertise: { contains: searchPattern, mode: "insensitive" } },
                        { designation: { contains: searchPattern, mode: "insensitive" } },
                    ],
                },
            },
        ];
    }

    const [total, trainers] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                trainerProfile: true,
                _count: {
                    select: {
                        coursesTaught: true,
                    },
                },
                coursesTaught: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        isPublished: true,
                        price: true,
                        _count: {
                            select: {
                                enrollments: true,
                                reviews: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const formattedTrainers = trainers.map((t) => {
        const totalEnrollments = t.coursesTaught.reduce(
            (acc, c) => acc + (c._count?.enrollments || 0),
            0
        );
        const totalReviews = t.coursesTaught.reduce(
            (acc, c) => acc + (c._count?.reviews || 0),
            0
        );

        return {
            id: t.id,
            name: t.trainerProfile?.name || t.name,
            email: t.email,
            phone: t.trainerProfile?.phone || t.phone,
            role: t.role,
            isActive: t.isActive,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            profile: t.trainerProfile,
            coursesCount: t._count.coursesTaught,
            totalStudents: totalEnrollments,
            totalReviews,
            courses: t.coursesTaught,
        };
    });

    return {
        trainers: formattedTrainers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getAdminTrainerById = async (id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { id },
                { trainerProfile: { id } },
            ],
        },
        include: {
            trainerProfile: true,
            coursesTaught: {
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    _count: { select: { enrollments: true, reviews: true, modules: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!user) {
        throw new Error("Trainer not found");
    }

    const totalStudents = user.coursesTaught.reduce(
        (acc, c) => acc + (c._count?.enrollments || 0),
        0
    );
    const totalReviews = user.coursesTaught.reduce(
        (acc, c) => acc + (c._count?.reviews || 0),
        0
    );

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        profile: user.trainerProfile,
        coursesCount: user.coursesTaught.length,
        totalStudents,
        totalReviews,
        courses: user.coursesTaught,
    };
};

export const updateAdminTrainer = async (
    id: string,
    data: UpdateAdminTrainerInput
) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { id },
                { trainerProfile: { id } },
            ],
        },
        include: { trainerProfile: true },
    });

    if (!user) {
        throw new Error("Trainer not found");
    }

    const userUpdate: any = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.isActive !== undefined) userUpdate.isActive = data.isActive;

    if (data.email) {
        const trimmedEmail = data.email.trim().toLowerCase();
        const existingEmail = await prisma.user.findFirst({
            where: { email: trimmedEmail, NOT: { id: user.id } },
        });
        if (existingEmail) {
            throw new Error("Email is already used by another user");
        }
        userUpdate.email = trimmedEmail;
    }

    if (data.phone) {
        const trimmedPhone = data.phone.trim();
        const existingPhone = await prisma.user.findFirst({
            where: { phone: trimmedPhone, NOT: { id: user.id } },
        });
        if (existingPhone) {
            throw new Error("Phone number is already used by another user");
        }
        userUpdate.phone = trimmedPhone;
    }

    if (data.password) {
        if (data.password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
        userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(userUpdate).length > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: userUpdate,
        });
    }

    let updatedProfile;
    if (user.trainerProfile) {
        updatedProfile = await prisma.trainerProfile.update({
            where: { userId: user.id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
                ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
                ...(data.bio !== undefined ? { bio: data.bio } : {}),
                ...(data.expertise !== undefined ? { expertise: data.expertise } : {}),
                ...(data.designation !== undefined ? { designation: data.designation } : {}),
            },
        });
    } else {
        updatedProfile = await prisma.trainerProfile.create({
            data: {
                userId: user.id,
                name: data.name || user.name || "Trainer",
                phone: data.phone ? data.phone.trim() : user.phone,
                avatarUrl: data.avatarUrl || null,
                bio: data.bio || null,
                expertise: data.expertise || null,
                designation: data.designation || "Instructor at Lemon Academy",
            },
        });
    }

    return {
        user: await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        }),
        trainerProfile: updatedProfile,
    };
};

export const deleteAdminTrainer = async (id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { id },
                { trainerProfile: { id } },
            ],
        },
        include: {
            trainerProfile: true,
            _count: {
                select: {
                    coursesTaught: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error("Trainer not found");
    }

    // If trainer has courses taught, demote to STUDENT role and deactivate to preserve course records
    if (user._count.coursesTaught > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                role: UserRole.STUDENT,
                isActive: false,
            },
        });
        return {
            success: true,
            message: `Trainer has ${user._count.coursesTaught} course(s). Role changed to STUDENT and account deactivated to preserve course records and student enrollments.`,
        };
    }

    // If no courses taught, delete TrainerProfile and demote role to STUDENT
    if (user.trainerProfile) {
        await prisma.trainerProfile.delete({
            where: { userId: user.id },
        });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            role: UserRole.STUDENT,
        },
    });

    return {
        success: true,
        message: "Trainer role revoked and trainer profile removed successfully",
    };
};
