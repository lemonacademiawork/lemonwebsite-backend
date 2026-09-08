import { Request, Response } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
} from "../services/order.service";

// ==================== CREATE ORDER ====================

export const createOrderController = async (
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

        const {
            courseId,
            orderNumber,
            amount,
            currency,
            razorpayOrderId,
            appliedCouponCode,
        } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        if (!orderNumber) {
            return res.status(400).json({
                success: false,
                message: "Order number is required",
            });
        }

        if (amount === undefined || amount === null) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const order = await createOrder(
            req.user.userId,
            {
                courseId,
                orderNumber,
                amount: Number(amount),
                currency,
                razorpayOrderId,
                appliedCouponCode,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create order";

        if (
            message === "Student not found" ||
            message === "Course not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message === "You are already registered for this course" ||
            message === "Student is already enrolled in this course"
        ) {
            return res.status(409).json({
                success: false,
                message: "Already registered for this course",
            });
        }

        if (message === "Order number already exists") {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

// ==================== GET ALL ORDERS ====================

export const getOrdersController = async (
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

        const orders = await getOrders(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

// ==================== GET ORDER BY ID ====================

export const getOrderByIdController = async (
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

        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        const order = await getOrderById(
            orderId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch order";

        if (message === "Order not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get order by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};

// ==================== UPDATE ORDER ====================

export const updateOrderController = async (
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

        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        const {
            status,
            razorpayOrderId,
            appliedCouponCode,
        } = req.body;

        const validStatuses = [
            "PENDING",
            "PAID",
            "FAILED",
            "CANCELLED",
            "REFUNDED",
        ] as const;

        if (
            status !== undefined &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const updatedOrder = await updateOrder(
            orderId,
            req.user.userId,
            {
                status,
                razorpayOrderId,
                appliedCouponCode,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update order";

        if (message === "Order not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Update order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order",
        });
    }
};
export const deleteOrderController = async (
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
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }
        const deletedOrder = await deleteOrder(
            orderId,
            req.user.userId,
        );
        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            data: deletedOrder,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to delete order";
        if (message === "Order not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }
        console.error("Delete order error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete order",
        });
    }
}
