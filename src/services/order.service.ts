import { prisma } from "../config/database";
import { OrderStatus } from "@prisma/client";

interface CreateOrderData {
    courseId: string;
    orderNumber: string;
    amount: number;
    currency?: string;
    razorpayOrderId?: string;
    appliedReferralCode?: string;
}

export const createOrder = async (
    studentId: string,
    data: CreateOrderData
) => {
    const student = await prisma.user.findUnique({
        where: {
            id: studentId,
        },
    });
    if (!student) {
        throw new Error("Student not found");
    }
    const course = await prisma.course.findUnique({
        where: {
            id: data.courseId,
        },
    });
    if (!course) {
        throw new Error("Course not found");
    }
    const existingOrder = await prisma.order.findUnique({
        where: {
            orderNumber: data.orderNumber,
        },
    });
    if (existingOrder) {
        throw new Error("Order number already exists");
    }
    const order = await prisma.order.create({
        data: {
            studentId,
            courseId: data.courseId,
            orderNumber: data.orderNumber,
            amount: data.amount,
            currency: data.currency ?? "INR",
            status: OrderStatus.PENDING,
            razorpayOrderId: data.razorpayOrderId,
            appliedReferralCode: data.appliedReferralCode,
        }
    });
    return order;
}
export const getOrders = async (studentId: string) => {
    const orders = await prisma.order.findMany({
        where: {
            studentId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnailUrl: true,
                },
            },
            payment: {
                select: {
                    id: true,
                    razorpayPaymentId: true,
                    amount: true,
                    status: true,
                    paymentMethod: true,
                    createdAt: true,
                },
            },
            enrollment: true,
        },
    });

    return orders;
};
export const getOrderById = async (
    orderId: string,
    studentId: string
) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            studentId,
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnailUrl: true,
                },
            },
            payment: {
                select: {
                    id: true,
                    razorpayPaymentId: true,
                    amount: true,
                    status: true,
                    paymentMethod: true,
                    createdAt: true,
                },
            },
            enrollment: true,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    return order;
};
