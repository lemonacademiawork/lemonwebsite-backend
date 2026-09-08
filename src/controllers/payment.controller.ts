import { Request, Response } from "express";
import {
    createPayment,
    getPayments,
    getPaymentById,
    createRazorpayOrder,
    processRazorpayWebhook,
} from "../services/payment.service";

export const handleRazorpayWebhookController = async (
    req: Request,
    res: Response
) => {
    try {
        const signature = req.headers["x-razorpay-signature"] as string;

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: "Missing x-razorpay-signature header",
            });
        }

        const result = await processRazorpayWebhook(req.body, signature);

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
            data: result,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to process webhook";

        if (
            message === "Invalid webhook signature" ||
            message === "Webhook payload missing event type" ||
            message === "Razorpay webhook secret is not configured on server"
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        console.error("Razorpay webhook error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error while processing webhook",
        });
    }
};

export const createRazorpayOrderController = async (
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

        const { courseId, orderId, appliedCouponCode, couponCode, coupon } = req.body;

        if (!courseId && !orderId) {
            return res.status(400).json({
                success: false,
                message: "Either courseId or orderId is required",
            });
        }

        const razorpayOrderData = await createRazorpayOrder(
            req.user.userId,
            {
                courseId,
                orderId,
                appliedCouponCode: appliedCouponCode || couponCode || coupon,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            data: razorpayOrderData,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create Razorpay order";

        if (
            message === "Course not found" ||
            message === "Student not found" ||
            message === "Order not found"
        ) {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message === "You are already registered for this course" ||
            message === "Student is already enrolled in this course" ||
            message === "Order is already paid"
        ) {
            return res.status(409).json({
                success: false,
                message: "Already registered for this course",
            });
        }

        if (
            message === "Course ID is required"
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        console.error("Create Razorpay order error:", error);

        return res.status(500).json({
            success: false,
            message: message.startsWith("Razorpay error:")
                ? message
                : "Failed to create Razorpay order",
        });
    }
};

export const createPaymentController = async (
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
            orderId,
            razorpayPaymentId,
            razorpaySignature,
            amount,
            paymentMethod,
            rawPayload,
        } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        if (!razorpayPaymentId) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment ID is required",
            });
        }

        if (!razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Razorpay signature is required",
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

        const payment = await createPayment(
            req.user.userId,
            {
                orderId,
                razorpayPaymentId,
                razorpaySignature,
                amount: Number(amount),
                paymentMethod,
                rawPayload,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create payment";

        if (message === "Order not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        if (
            message ===
            "Payment already exists for this order"
        ) {
            return res.status(409).json({
                success: false,
                message,
            });
        }

        console.error("Create payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment",
        });
    }
};
export const getPaymentsController = async (
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

        const payments = await getPayments(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (error) {
        console.error("Get payments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
        });
    }
};
export const getPaymentByIdController = async (
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

        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }

        const payment = await getPaymentById(
            paymentId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch payment";

        if (message === "Payment not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Get payment by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payment",
        });
    }
};