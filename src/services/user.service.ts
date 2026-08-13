import { prisma } from "../config/database";

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
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
export const updateCurrentUser = async (
    userId: string,
    data: {
        name?: string;
        phone?: string;
        bio?: string;
        avatarUrl?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            studentProfile: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.studentProfile) {
        throw new Error("Student profile not found");
    }

    const updatedProfile = await prisma.studentProfile.update({
        where: {
            userId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),

            ...(data.phone !== undefined && {
                phone: data.phone,
            }),

            ...(data.bio !== undefined && {
                bio: data.bio,
            }),

            ...(data.avatarUrl !== undefined && {
                avatarUrl: data.avatarUrl,
            }),
        },
    });

    return updatedProfile;
};
