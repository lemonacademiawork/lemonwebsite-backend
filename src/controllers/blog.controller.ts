import { Request, Response } from "express";
import { createBlog, getBlogs, getBlogById, getBlogBySlug, updateBlog, toggleBlogPublish, deleteBlog } from "../services/blog.service";

export const createBlogController = async (
    req: Request,
    res: Response
) => {
    try {
        // 1. Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 2. Get blog data from request body
        const {
            categoryId,
            title,
            slug,
            content,
            featuredImageUrl,
            tags,
            seoTitle,
            seoDescription,
        } = req.body;

        // 3. Basic validation
        if (!title || !slug || !content) {
            return res.status(400).json({
                success: false,
                message: "Title, slug and content are required",
            });
        }

        // 4. Create blog
        const blog = await createBlog(
            req.user.userId,
            {
                categoryId,
                title,
                slug,
                content,
                featuredImageUrl,
                tags,
                seoTitle,
                seoDescription,
            }
        );

        // 5. Return response
        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create blog";

        if (
            message ===
            "Blog with this slug already exists"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        if (message === "Blog category not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Create blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create blog",
        });
    }
};
export const getBlogsController = async (
    req: Request,
    res: Response
) => {
    try {
        const blogs = await getBlogs();

        return res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        console.error("Get blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
        });
    }
};

export const getBlogBySlugController = async (
    req: Request,
    res: Response
) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Blog slug is required",
            });
        }

        const blog = await getBlogBySlug(slug);

        return res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch blog";

        if (message === "Blog not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get blog by slug error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
        });
    }
};

export const getBlogByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
        }

        const blog = await getBlogById(id);

        return res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch blog";

        if (message === "Blog not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get blog by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
        });
    }
};
export const updateBlogController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
        }

        const blog = await updateBlog(id, req.user.userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update blog";

        if (message === "Blog not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "Blog with this slug already exists"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        if (message === "Blog category not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Update blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blog",
        });
    }
};
export const toggleBlogPublishController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
        }

        const blog = await toggleBlogPublish(id, req.user.userId);

        return res.status(200).json({
            success: true,
            message:
                blog.status === "PUBLISHED"
                    ? "Blog published successfully"
                    : "Blog unpublished successfully",
            data: blog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update blog status";

        if (message === "Blog not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error(
            "Toggle blog publish error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update blog status",
        });
    }
};
export const deleteBlogController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required",
            });
        }

        const deletedBlog = await deleteBlog(id, req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
            data: deletedBlog,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete blog";

        if (message === "Blog not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Delete blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete blog",
        });
    }
};