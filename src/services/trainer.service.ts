import { prisma } from "../config/database";

export const getMyTrainerProfile = async (userId: string) => {
    const trainer = await prisma.trainerProfile.findUnique({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
        },
    });

    if (!trainer) {
        throw new Error("Trainer profile not found");
    }

    return trainer;
};

export const updateMyTrainerProfile = async (
    userId: string,
    data: {
        name?: string;
        phone?: string;
        email?: string;
        avatarUrl?: string;
        bio?: string;
        expertise?: string;
        designation?: string;
    }
) => {
    const trainer = await prisma.trainerProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!trainer) {
        throw new Error("Trainer profile not found");
    }

    const userUpdateData: { name?: string; phone?: string; email?: string } = {};

    if (data.name !== undefined) {
        userUpdateData.name = data.name;
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
        userUpdateData.phone = trimmedPhone;
    }

    if (data.email) {
        const trimmedEmail = data.email.trim().toLowerCase();
        const existingEmail = await prisma.user.findFirst({
            where: {
                email: trimmedEmail,
                NOT: { id: userId },
            },
        });
        if (existingEmail) {
            throw new Error("Email address is already in use by another account");
        }
        userUpdateData.email = trimmedEmail;
    }

    if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: userUpdateData,
        });
    }

    const updatedTrainer = await prisma.trainerProfile.update({
        where: {
            userId,
        },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone.trim() }),
            ...(data.avatarUrl !== undefined && {
                avatarUrl: data.avatarUrl,
            }),
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.expertise !== undefined && {
                expertise: data.expertise,
            }),
            ...(data.designation !== undefined && {
                designation: data.designation,
            }),
        },
    });

    return updatedTrainer;
};

export const getMyTrainerCourses = async (userId: string) => {
    const courses = await prisma.course.findMany({
        where: {
            trainerId: userId,
        },
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return courses;
};

export const getMyTrainerDashboard = async (userId: string) => {
    const [
        totalCourses,
        totalEnrollments,
        reviewStats,
        pendingGalleryReviews,
        recentCourses,
    ] = await Promise.all([
        prisma.course.count({
            where: { trainerId: userId },
        }),
        prisma.enrollment.count({
            where: {
                course: { trainerId: userId },
            },
        }),
        prisma.review.aggregate({
            where: {
                course: { trainerId: userId },
            },
            _avg: { rating: true },
            _count: { rating: true },
        }),
        prisma.gallerySubmission.count({
            where: {
                course: { trainerId: userId },
                trainerFeedback: null,
            },
        }),
        prisma.course.findMany({
            where: { trainerId: userId },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                _count: {
                    select: {
                        enrollments: true,
                        modules: true,
                    },
                },
            },
        }),
    ]);

    return {
        stats: {
            totalCourses,
            totalStudents: totalEnrollments,
            totalReviews: reviewStats._count.rating,
            averageRating: reviewStats._avg.rating || 0,
            pendingGalleryReviews,
        },
        recentCourses,
    };
};

export const getMyTrainerStudents = async (userId: string) => {
    const enrollments = await prisma.enrollment.findMany({
        where: {
            course: {
                trainerId: userId,
            },
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    studentProfile: {
                        select: {
                            avatarUrl: true,
                            phone: true,
                        },
                    },
                },
            },
            course: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            enrolledAt: "desc",
        },
    });

    return enrollments;
};

export const getMyTrainerReviews = async (userId: string) => {
    const reviews = await prisma.review.findMany({
        where: {
            course: {
                trainerId: userId,
            },
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    studentProfile: {
                        select: {
                            avatarUrl: true,
                        },
                    },
                },
            },
            course: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return reviews;
};

export const getMyTrainerGallerySubmissions = async (userId: string) => {
    const submissions = await prisma.gallerySubmission.findMany({
        where: {
            course: {
                trainerId: userId,
            },
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    studentProfile: {
                        select: {
                            avatarUrl: true,
                        },
                    },
                },
            },
            course: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return submissions;
};

export const updateTrainerGalleryFeedback = async (
    userId: string,
    submissionId: string,
    feedback: string
) => {
    const submission = await prisma.gallerySubmission.findFirst({
        where: {
            id: submissionId,
            course: {
                trainerId: userId,
            },
        },
    });

    if (!submission) {
        throw new Error("Gallery submission not found or not associated with your course");
    }

    const updatedSubmission = await prisma.gallerySubmission.update({
        where: {
            id: submissionId,
        },
        data: {
            trainerFeedback: feedback,
        },
    });

    return updatedSubmission;
};