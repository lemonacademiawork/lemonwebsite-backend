import { prisma } from "../config/database";

interface CreateBlogCategoryData {
    name: string;
    slug: string;
    description?: string;
}

export const createBlogCategory = async (
    data: CreateBlogCategoryData
) => {
    // 1. Check whether category name already exists
    const existingName = await prisma.blogCategory.findUnique({
        where: {
            name: data.name,
        },
    });

    if (existingName) {
        throw new Error("Blog category name already exists");
    }

    // 2. Check whether slug already exists
    const existingSlug = await prisma.blogCategory.findUnique({
        where: {
            slug: data.slug,
        },
    });

    if (existingSlug) {
        throw new Error("Blog category slug already exists");
    }

    // 3. Create category
    const category = await prisma.blogCategory.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
        },
    });

    return category;
};
export const getBlogCategories = async () => {
    const categories = await prisma.blogCategory.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return categories;
};
export const getBlogCategoryById = async (categoryId: string) => {
    const category = await prisma.blogCategory.findUnique({
        where: {
            id: categoryId,
        },
        include: {
            blogs: true,
        },
    });

    if (!category) {
        throw new Error("Blog category not found");
    }

    return category;
};
export const updateBlogCategory = async (
    categoryId: string,
    data: {
        name?: string;
        slug?: string;
        description?: string;
    }
) => {
    const existingCategory = await prisma.blogCategory.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (!existingCategory) {
        throw new Error("Blog category not found");
    }

    if (data.name && data.name !== existingCategory.name) {
        const existingName = await prisma.blogCategory.findUnique({
            where: {
                name: data.name,
            },
        });

        if (existingName) {
            throw new Error("Blog category name already exists");
        }
    }

    if (data.slug && data.slug !== existingCategory.slug) {
        const existingSlug = await prisma.blogCategory.findUnique({
            where: {
                slug: data.slug,
            },
        });

        if (existingSlug) {
            throw new Error("Blog category slug already exists");
        }
    }

    const category = await prisma.blogCategory.update({
        where: {
            id: categoryId,
        },
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
        },
    });

    return category;
};
export const deleteBlogCategory = async (categoryId: string) => {
    const category = await prisma.blogCategory.findUnique({
        where: {
            id: categoryId,
        },
        include: {
            blogs: true,
        },
    });

    if (!category) {
        throw new Error("Blog category not found");
    }

    // Prevent deletion if blogs are using this category
    if (category.blogs.length > 0) {
        throw new Error(
            "Cannot delete category because blogs are associated with it"
        );
    }

    await prisma.blogCategory.delete({
        where: {
            id: categoryId,
        },
    });

    return true;
};