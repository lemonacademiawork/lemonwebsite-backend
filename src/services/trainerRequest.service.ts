import { prisma } from "../config/database";
import { TrainerRequestStatus, UserRole } from "@prisma/client";

export interface SubmitTrainerRequestInput {
    name: string;
    phone: string;
    email?: string;
    expertise: string;
    experienceYears?: number;
    bio?: string;
    portfolioUrl?: string;
    sampleVideoUrl?: string;
    resumeUrl?: string;
}

export const submitTrainerRequest = async (
    input: SubmitTrainerRequestInput,
    userId?: string
) => {
    const {
        name,
        phone,
        email,
        expertise,
        experienceYears,
        bio,
        portfolioUrl,
        sampleVideoUrl,
        resumeUrl,
    } = input;

    if (!name || !name.trim()) {
        throw new Error("Name is required");
    }

    if (!phone || !phone.trim()) {
        throw new Error("Phone number is required");
    }

    if (!expertise || !expertise.trim()) {
        throw new Error("Field of expertise is required");
    }

    const trimmedPhone = phone.trim();

    // Check if there is already a pending application for this user/phone
    const existingPending = await prisma.trainerRequest.findFirst({
        where: {
            status: TrainerRequestStatus.PENDING,
            OR: [
                { phone: trimmedPhone },
                ...(userId ? [{ userId }] : []),
                ...(email && email.trim() ? [{ email: email.trim().toLowerCase() }] : []),
            ],
        },
    });

    if (existingPending) {
        throw new Error("You already have a pending trainer application under review");
    }

    // If userId was not passed, check if a user with this phone exists
    let effectiveUserId = userId;
    if (!effectiveUserId) {
        const existingUser = await prisma.user.findFirst({
            where: { phone: trimmedPhone },
        });
        if (existingUser) {
            effectiveUserId = existingUser.id;
        }
    }

    const request = await prisma.trainerRequest.create({
        data: {
            userId: effectiveUserId || null,
            name: name.trim(),
            phone: trimmedPhone,
            email: email ? email.trim().toLowerCase() : null,
            expertise: expertise.trim(),
            experienceYears: experienceYears ? Number(experienceYears) : null,
            bio: bio ? bio.trim() : null,
            portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
            sampleVideoUrl: sampleVideoUrl ? sampleVideoUrl.trim() : null,
            resumeUrl: resumeUrl ? resumeUrl.trim() : null,
            status: TrainerRequestStatus.PENDING,
        },
        include: {
            user: {
                select: { id: true, name: true, phone: true, email: true, role: true },
            },
        },
    });

    return request;
};

export const getMyTrainerRequests = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const requests = await prisma.trainerRequest.findMany({
        where: {
            OR: [
                { userId },
                ...(user.phone ? [{ phone: user.phone }] : []),
                ...(user.email ? [{ email: user.email }] : []),
            ],
        },
        orderBy: { createdAt: "desc" },
    });

    return requests;
};

export const getAllTrainerRequests = async (query: {
    status?: TrainerRequestStatus;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
        where.status = query.status;
    }

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
            { expertise: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [total, requests] = await Promise.all([
        prisma.trainerRequest.count({ where }),
        prisma.trainerRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, phone: true, email: true, role: true },
                },
                reviewer: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
    ]);

    return {
        requests,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getTrainerRequestById = async (id: string) => {
    const request = await prisma.trainerRequest.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    role: true,
                    studentProfile: true,
                    trainerProfile: true,
                },
            },
            reviewer: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    if (!request) {
        throw new Error("Trainer application request not found");
    }

    return request;
};

export const updateTrainerRequestStatus = async (
    id: string,
    adminId: string,
    data: {
        status: TrainerRequestStatus;
        adminNotes?: string;
    }
) => {
    const request = await prisma.trainerRequest.findUnique({
        where: { id },
        include: { user: true },
    });

    if (!request) {
        throw new Error("Trainer application request not found");
    }

    const updated = await prisma.trainerRequest.update({
        where: { id },
        data: {
            status: data.status,
            adminNotes: data.adminNotes,
            reviewedBy: adminId,
            reviewedAt: new Date(),
        },
        include: {
            user: {
                select: { id: true, name: true, phone: true, email: true, role: true },
            },
            reviewer: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    // If APPROVED and user exists, automatically promote to TRAINER role and create TrainerProfile
    if (data.status === TrainerRequestStatus.APPROVED && request.userId) {
        const userId = request.userId;

        // Upgrade user role to TRAINER
        await prisma.user.update({
            where: { id: userId },
            data: { role: UserRole.TRAINER },
        });

        // Ensure TrainerProfile exists
        const existingTrainerProfile = await prisma.trainerProfile.findUnique({
            where: { userId },
        });

        if (!existingTrainerProfile) {
            await prisma.trainerProfile.create({
                data: {
                    userId,
                    name: request.name,
                    phone: request.phone,
                    expertise: request.expertise,
                    bio: request.bio || `Instructor specializing in ${request.expertise}`,
                    designation: "Instructor at Lemon Academy",
                },
            });
        }
    }

    return updated;
};

export const deleteTrainerRequest = async (id: string) => {
    const existing = await prisma.trainerRequest.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("Trainer application request not found");
    }

    await prisma.trainerRequest.delete({
        where: { id },
    });

    return {
        message: "Trainer application request deleted successfully",
    };
};
