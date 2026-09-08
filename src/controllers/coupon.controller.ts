import { Request, Response } from "express";
import {
    validateCoupon,
    createCoupon,
    getAllCoupons,
    getPublicCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
} from "../services/coupon.service";

export const validateCouponController = async (req: Request, res: Response) => {
    try {
        const { code, couponCode, coupon, courseId, amount, purchaseAmount, price } = req.body;
        const userId = req.user?.userId;

        const effectiveCode = code || couponCode || coupon;
        const effectiveAmount = amount ?? purchaseAmount ?? price;

        if (!effectiveCode) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        const result = await validateCoupon({
            code: effectiveCode,
            courseId,
            amount: effectiveAmount !== undefined ? Number(effectiveAmount) : 0,
            userId,
        });

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to validate coupon";
        return res.status(400).json({
            success: false,
            message,
        });
    }
};

export const getPublicCouponsController = async (req: Request, res: Response) => {
    try {
        const courseId = req.query.courseId as string | undefined;
        const coupons = await getPublicCoupons(courseId);

        return res.status(200).json({
            success: true,
            message: "Active promotional coupons retrieved successfully",
            data: coupons,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve promotional coupons";
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getAllCouponsController = async (req: Request, res: Response) => {
    try {
        const { isActive, courseId, search, page, limit } = req.query;

        const result = await getAllCoupons({
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            courseId: courseId as string | undefined,
            search: search as string | undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Coupons retrieved successfully",
            data: result.coupons,
            pagination: result.pagination,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve coupons";
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const getCouponByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const coupon = await getCouponById(id);

        return res.status(200).json({
            success: true,
            message: "Coupon details retrieved successfully",
            data: coupon,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve coupon";
        const statusCode = message === "Coupon not found" ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const createCouponController = async (req: Request, res: Response) => {
    try {
        const { code, discountValue } = req.body;

        if (!code || discountValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and discountValue are required",
            });
        }

        const coupon = await createCoupon(req.body);

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: coupon,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create coupon";
        return res.status(400).json({
            success: false,
            message,
        });
    }
};

export const updateCouponController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await updateCoupon(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: updated,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update coupon";
        const statusCode = message === "Coupon not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};

export const deleteCouponController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await deleteCoupon(id);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete coupon";
        const statusCode = message === "Coupon not found" ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
