import { prisma } from "../config/database";
import { EnrollmentSource } from "@prisma/client";

interface CreatePaymentInput {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    paymentMethod?: string;
    rawPayload?: unknown;
}

export const createPayment = async (
    studentId: string,
    data: CreatePaymentInput
) => {
    // 1. Check whether the order exists
    const order = await prisma.order.findFirst({
        where: {
            id: data.orderId,
            studentId,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    // 2. Check whether payment already exists
    const existingPayment = await prisma.payment.findUnique({
        where: {
            orderId: data.orderId,
        },
    });

    if (existingPayment) {
        throw new Error(
            "Payment already exists for this order"
        );
    }

    // 3. Create payment, update order and create enrollment
    // inside one transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create payment
        const payment = await tx.payment.create({
            data: {
                orderId: data.orderId,
                studentId,
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                rawPayload: data.rawPayload as any,
                status: "CAPTURED",
            },
        });

        // Mark order as PAID
        const updatedOrder = await tx.order.update({
            where: {
                id: data.orderId,
            },
            data: {
                status: "PAID",
            },
        });

        // Check if enrollment already exists
        const existingEnrollment =
            await tx.enrollment.findFirst({
                where: {
                    studentId,
                    courseId: order.courseId,
                },
            });

        let enrollment;

        if (existingEnrollment) {
            enrollment = existingEnrollment;
        } else {
            // Create enrollment
            enrollment = await tx.enrollment.create({
                data: {
                    studentId,
                    courseId: order.courseId,
                    orderId: order.id,
                    source: EnrollmentSource.ONLINE_PAYMENT,
                    status: "ACTIVE",
                },
            });
        }

        return {
            payment,
            order: updatedOrder,
            enrollment,
        };
    });

    return result;
};

export const getPayments = async (studentId: string) => {
    const payments = await prisma.payment.findMany({
        where: {
            studentId,
        },
        include: {
            order: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return payments;
};

export const getPaymentById = async (
    paymentId: string,
    studentId: string
) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            studentId,
        },
        include: {
            order: true,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
};