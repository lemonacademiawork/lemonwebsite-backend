import { Request, Response } from "express";
import {
    createBlogCategory, getBlogCategories, getBlogCategoryById, updateBlogCategory, deleteBlogCategory
} from "../services/blogCategory.service";

export const createBlogCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, slug, description } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required",
            });
        }

        const category = await createBlogCategory({
            name,
            slug,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Blog category created successfully",
            data: category,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create blog category";

        if (
            message === "Blog category name already exists" ||
            message === "Blog category slug already exists"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Create blog category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create blog category",
        });
    }
};
export const getBlogCategoriesController = async (
    req: Request,
    res: Response
) => {
    try {
        const categories = await getBlogCategories();

        return res.status(200).json({
            success: true,
            message: "Blog categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error("Get blog categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog categories",
        });
    }
};
export const getBlogCategoryByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }
        const category = await getBlogCategoryById(id);
        return res.status(200).json({
            success: true,
            message: "Blog category fetched successfully",
            data: category,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch blog category";
        if (message === "Blog category not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }
        console.error("Get blog category by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog category",
        });
    }
};

export const updateBlogCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { name, slug, description } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        const category = await updateBlogCategory(id, {
            name,
            slug,
            description,
        });

        return res.status(200).json({
            success: true,
            message: "Blog category updated successfully",
            data: category,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update blog category";

        if (message === "Blog category not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message === "Blog category name already exists" ||
            message === "Blog category slug already exists"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Update blog category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blog category",
        });
    }
};
export const deleteBlogCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        await deleteBlogCategory(id);

        return res.status(200).json({
            success: true,
            message: "Blog category deleted successfully",
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete blog category";

        if (message === "Blog category not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "Cannot delete category because blogs are associated with it"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Delete blog category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete blog category",
        });
    }
};