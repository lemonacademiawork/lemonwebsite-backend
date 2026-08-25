
import { prisma } from "../config/database";

interface CreateBlogData {
    categoryId?: string;
    title: string;
    slug: string;
    content: string;
    featuredImageUrl?: string;
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string;
}

export const createBlog = async (
    authorId: string,
    data: CreateBlogData
) => {
    // 1. Check whether slug already exists
    const existingBlog = await prisma.blog.findUnique({
        where: {
            slug: data.slug,
        },
    });

    if (existingBlog) {
        throw new Error("Blog with this slug already exists");
    }

    // 2. If categoryId is provided, check category
    if (data.categoryId) {
        const category = await prisma.blogCategory.findUnique({
            where: {
                id: data.categoryId,
            },
        });

        if (!category) {
            throw new Error("Blog category not found");
        }
    }

    // 3. Create blog
    const blog = await prisma.blog.create({
        data: {
            authorId,
            categoryId: data.categoryId,
            title: data.title,
            slug: data.slug,
            content: data.content,
            featuredImageUrl: data.featuredImageUrl,
            tags: data.tags ?? [],
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            status: "DRAFT",
        },
        include: {
            author: true,
            category: true,
        },
    });

    return blog;
};
export const getBlogs = async () => {
    const blogs = await prisma.blog.findMany({
        include: {
            author: true,
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return blogs;
};

export const getBlogById = async (blogId: string) => {
    const blog = await prisma.blog.findUnique({
        where: {
            id: blogId,
        },
        include: {
            author: true,
            category: true,
        },
    });

    if (!blog) {
        throw new Error("Blog not found");
    }

    return blog;
};

interface UpdateBlogData {
    categoryId?: string | null;
    title?: string;
    slug?: string;
    content?: string;
    featuredImageUrl?: string | null;
    tags?: string[];
    seoTitle?: string | null;
    seoDescription?: string | null;
}

export const updateBlog = async (
    blogId: string,
    authorId: string,
    data: UpdateBlogData
) => {
    // 1. Check whether blog exists and belongs to author
    const existingBlog = await prisma.blog.findFirst({
        where: {
            id: blogId,
            authorId,
        },
    });

    if (!existingBlog) {
        throw new Error("Blog not found");
    }

    // 2. If slug is being changed, check for duplicate
    if (data.slug && data.slug !== existingBlog.slug) {
        const slugExists = await prisma.blog.findUnique({
            where: {
                slug: data.slug,
            },
        });

        if (slugExists) {
            throw new Error(
                "Blog with this slug already exists"
            );
        }
    }

    // 3. If category is being changed, check it
    if (data.categoryId) {
        const category = await prisma.blogCategory.findUnique({
            where: {
                id: data.categoryId,
            },
        });

        if (!category) {
            throw new Error("Blog category not found");
        }
    }
    const blog = await prisma.blog.update({
        where: {
            id: blogId,
        },
        data,
        include: {
            author: true,
            category: true,
        },
    });

    return blog;
};
export const toggleBlogPublish = async (
    blogId: string,
    authorId: string
) => {
    const blog = await prisma.blog.findFirst({
        where: {
            id: blogId,
            authorId,
        },
    });

    if (!blog) {
        throw new Error("Blog not found");
    }

    const isPublished = blog.status === "PUBLISHED";

    const updatedBlog = await prisma.blog.update({
        where: {
            id: blogId,
        },
        data: {
            status: isPublished ? "DRAFT" : "PUBLISHED",
            publishedAt: isPublished ? null : new Date(),
        },
        include: {
            author: true,
            category: true,
        },
    });

    return updatedBlog;
};
export const deleteBlog = async (blogId: string, authorId: string) => {
    const existingBlog = await prisma.blog.findFirst({
        where: {
            id: blogId,
            authorId,
        },
    });

    if (!existingBlog) {
        throw new Error("Blog not found");
    }

    await prisma.blog.delete({
        where: {
            id: blogId,
        },
    });

    return {
        id: blogId,
    };
};