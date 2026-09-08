import { prisma } from "../config/database";
import { TrainerRequestStatus, UserRole } from "@prisma/client";

export interface SubmitTrainerRequestInput {
    name?: string;
    fullName?: string;
    phone?: string;
    phoneNumber?: string;
    email?: string;
    emailAddress?: string;
    expertise?: string;
    courseSubject?: string;
    craftSubject?: string;
    subject?: string;
    experienceYears?: number | string;
    experience?: number | string;
    yearsOfExperience?: number | string;
    proposedSchedule?: string;
    classDatesTimes?: string;
    proposedClassDatesTimes?: string;
    schedule?: string;
    bio?: string;
    portfolioUrl?: string;
    portfolio?: string;
    website?: string;
    sampleVideoUrl?: string;
    sampleVideo?: string;
    videoUrl?: string;
    resumeUrl?: string;
    resume?: string;
}

export const submitTrainerRequest = async (
    input: SubmitTrainerRequestInput,
    userId?: string
) => {
    const rawName = input.name || input.fullName || "";
    const rawPhone = input.phone || input.phoneNumber || "";
    const rawEmail = input.email || input.emailAddress || "";
    const rawExpertise = input.expertise || input.courseSubject || input.craftSubject || input.subject || "";
    const rawExperience = input.experienceYears || input.experience || input.yearsOfExperience;
    const rawSchedule = input.proposedSchedule || input.classDatesTimes || input.proposedClassDatesTimes || input.schedule || "";
    const rawBio = input.bio || "";
    const rawPortfolio = input.portfolioUrl || input.portfolio || input.website || "";
    const rawSampleVideo = input.sampleVideoUrl || input.sampleVideo || input.videoUrl || "";
    const rawResume = input.resumeUrl || input.resume || "";

    if (!rawName || !rawName.trim()) {
        throw new Error("Full name is required");
    }

    if (!rawPhone || !rawPhone.trim()) {
        throw new Error("Phone number is required");
    }

    if (!rawExpertise || !rawExpertise.trim()) {
        throw new Error("Course/Craft Subject is required");
    }

    const trimmedPhone = rawPhone.trim();
    const parsedExpYears = rawExperience !== undefined && rawExperience !== null && !isNaN(Number(rawExperience))
        ? Number(rawExperience)
        : null;

    // Check if there is already a pending application for this user/phone
    const existingPending = await prisma.trainerRequest.findFirst({
        where: {
            status: TrainerRequestStatus.PENDING,
            OR: [
                { phone: trimmedPhone },
                ...(userId ? [{ userId }] : []),
                ...(rawEmail && rawEmail.trim() ? [{ email: rawEmail.trim().toLowerCase() }] : []),
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
            name: rawName.trim(),
            phone: trimmedPhone,
            email: rawEmail ? rawEmail.trim().toLowerCase() : null,
            expertise: rawExpertise.trim(),
            experienceYears: parsedExpYears,
            proposedSchedule: rawSchedule ? rawSchedule.trim() : null,
            bio: rawBio ? rawBio.trim() : null,
            portfolioUrl: rawPortfolio ? rawPortfolio.trim() : null,
            sampleVideoUrl: rawSampleVideo ? rawSampleVideo.trim() : null,
            resumeUrl: rawResume ? rawResume.trim() : null,
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
