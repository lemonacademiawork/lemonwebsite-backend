import { prisma } from "../config/database";
import bcrypt from "bcrypt";

export const getCurrentUser = async (userId: string) => {
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
            trainerProfile: true,
            enrollments: {
                include: {
                    course: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
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

    if (data.phone !== undefined && data.phone.trim()) {
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
            ...(data.name !== undefined && {
                name: data.name,
            }),

            ...(data.phone !== undefined && {
                phone: data.phone.trim(),
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

export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.passwordHash
    );

    if (!isCurrentPasswordCorrect) {
        throw new Error("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(
        newPassword,
        10
    );

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            passwordHash: newPasswordHash,
        },
    });

    return true;
};