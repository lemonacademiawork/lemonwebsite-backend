import { prisma } from "../config/database";

export const getMyReferrals = async (userId: string) => {
    return await prisma.referral.findMany({
        where: {
            referrerStudentId: userId,
        },
        include: {
            referred: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            referralCommissions: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getMyReferralCommissions = async (
    userId: string
) => {
    return await prisma.referralCommission.findMany({
        where: {
            referrerStudentId: userId,
        },
        include: {
            referral: true,
            order: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getReferralById = async (
    referralId: string,
    userId: string
) => {
    const referral = await prisma.referral.findFirst({
        where: {
            id: referralId,
            referrerStudentId: userId,
        },
        include: {
            referred: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            referralCommissions: true,
        },
    });

    if (!referral) {
        throw new Error("Referral not found");
    }

    return referral;
};

export const validateReferralCode = async (code: string) => {
    const profile = await prisma.studentProfile.findUnique({
        where: {
            referralCode: code,
        },
        select: {
            id: true,
            userId: true,
            name: true,
            avatarUrl: true,
            referralCode: true,
            isEligibleForReferral: true,
        },
    });

    if (!profile) {
        throw new Error("Invalid referral code");
    }

    return {
        valid: true,
        referrer: {
            userId: profile.userId,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            referralCode: profile.referralCode,
            isEligibleForReferral: profile.isEligibleForReferral,
        },
    };
};