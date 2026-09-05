import { prisma } from "../config/database";

export const getAllCategories = async () => {
    return await prisma.category.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};
export const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: {
            id
        }
    })
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
};

export const getCategoryBySlug = async (slug: string) => {
    const category = await prisma.category.findUnique({
        where: {
            slug,
        },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};
export const createCategory = async (data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}) => {
    const existingCategory = await prisma.category.findFirst({
        where: {
            OR: [
                { name: data.name },
                { slug: data.slug },
            ],
        },
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    return await prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            imageUrl: data.imageUrl,
        },
    });
};

export const updateCategory = async (
    id: string,
    data: {
        name?: string;
        slug?: string;
        description?: string;
        imageUrl?: string;
    }
) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return await prisma.category.update({
        where: { id },
        data,
    });
};

export const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return await prisma.category.delete({
        where: { id },
    });
};