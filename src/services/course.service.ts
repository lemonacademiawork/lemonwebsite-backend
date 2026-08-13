import { prisma } from "../config/database";

interface CreateCourseData {
    title: string;
    slug: string;
    description: string;
    price: number;
    discountedPrice?: number;
    thumbnailUrl?: string;
    categoryId?: string;
}

export const createCourse = async (
    data: CreateCourseData,
    trainerId: string
) => {
    const existingCourse = await prisma.course.findUnique({
        where: {
            slug: data.slug,
        },
    });

    if (existingCourse) {
        throw new Error("Course with this slug already exists");
    }

    const course = await prisma.course.create({
        data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            price: data.price,
            discountedPrice: data.discountedPrice,
            thumbnailUrl: data.thumbnailUrl,
            categoryId: data.categoryId,
            trainerId,
        },
    });

    return course;
};
export const getAllCourses = async () => {
    const courses = await prisma.course.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            trainer: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    return courses;
};