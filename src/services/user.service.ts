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
