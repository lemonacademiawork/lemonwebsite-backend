import { Request, Response } from "express";
import {
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/category.service";

export const getCategories = async (
    req: Request,
    res: Response
) => {
    try {
        const categories = await getAllCategories();

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch categories",
        });
    }
};

export const getCategoryBySlugController = async (
    req: Request,
    res: Response
) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Category slug is required",
            });
        }

        const category = await getCategoryBySlug(slug);

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch category";

        return res.status(
            message === "Category not found" ? 404 : 500
        ).json({
            success: false,
            message,
        });
    }
};

export const getCategory = async (
    req: Request,
    res: Response
) => {
    try {
        const category = await getCategoryById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch category";

        return res.status(
            message === "Category not found" ? 404 : 500
        ).json({
            success: false,
            message,
        });
    }
};

export const createCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            slug,
            description,
            imageUrl,
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required",
            });
        }

        const category = await createCategory({
            name,
            slug,
            description,
            imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create category",
        });
    }
};

export const updateCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        const category = await updateCategory(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update category";

        return res.status(
            message === "Category not found" ? 404 : 400
        ).json({
            success: false,
            message,
        });
    }
};

export const deleteCategoryController = async (
    req: Request,
    res: Response
) => {
    try {
        await deleteCategory(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete category";

        return res.status(
            message === "Category not found" ? 404 : 400
        ).json({
            success: false,
            message,
        });
    }
};