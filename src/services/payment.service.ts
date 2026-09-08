import { prisma } from "../config/database";
import {
    EnrollmentSource,
    OrderStatus,
    PaymentStatus,
    EnrollmentStatus,
    CommissionStatus,
} from "@prisma/client";
import { razorpayInstance } from "../config/razorpay";
import crypto from "crypto";
import { validateCoupon, recordCouponUsage } from "./coupon.service";

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

interface CreateRazorpayOrderInput {
    courseId?: string;
    orderId?: string;
    appliedReferralCode?: string;
    appliedCouponCode?: string;
    couponCode?: string;
}

export const createRazorpayOrder = async (
    studentId: string,
    data: CreateRazorpayOrderInput
) => {
    let courseId = data.courseId;
    let existingOrder = null;

    if (data.orderId) {
        existingOrder = await prisma.order.findFirst({
            where: {
                id: data.orderId,
                studentId,
            },
            include: {
                course: true,
            },
        });

        if (!existingOrder) {
            throw new Error("Order not found");
        }

        if (existingOrder.status === OrderStatus.PAID) {
            throw new Error("Order is already paid");
        }

        courseId = existingOrder.courseId;
    }

    if (!courseId) {
        throw new Error("Course ID is required");
    }

    // 1. Verify student exists
    const student = await prisma.user.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error("Student not found");
    }

    // 2. Verify course exists
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // 3. Verify student is not already actively enrolled (One purchase per user)
    const activeEnrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId,
            status: "ACTIVE",
        },
    });

    if (activeEnrollment) {
        throw new Error("You are already registered for this course");
    }

    // 4. Validate referral code if provided
    const referralCode = data.appliedReferralCode || existingOrder?.appliedReferralCode;
    if (referralCode) {
        const referrerProfile = await prisma.studentProfile.findUnique({
            where: { referralCode: referralCode.trim() },
        });

        if (!referrerProfile) {
            throw new Error("Invalid referral code");
        }

        if (referrerProfile.userId === studentId) {
            throw new Error("You cannot apply your own referral code");
        }
    }

    // 5. Calculate base price from DB
    const basePrice = course.discountedPrice
        ? Number(course.discountedPrice)
        : Number(course.price);

    let finalPrice = basePrice;
    let validCouponCode = data.appliedCouponCode || data.couponCode || existingOrder?.appliedCouponCode || undefined;

    // 6. Validate & apply coupon discount if provided
    if (validCouponCode) {
        try {
            const couponResult = await validateCoupon({
                code: validCouponCode,
                courseId: course.id,
                amount: basePrice,
                userId: studentId,
            });
            finalPrice = couponResult.finalAmount;
            validCouponCode = couponResult.coupon.code;
        } catch (couponErr) {
            throw new Error(couponErr instanceof Error ? couponErr.message : "Invalid coupon code");
        }
    }

    const amountInPaise = Math.round(finalPrice * 100);

    // 7. Generate or use existing orderNumber
    const orderNumber =
        existingOrder?.orderNumber ||
        `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 8. Create Razorpay order
    let razorpayOrder;
    try {
        razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.max(100, amountInPaise), // Razorpay minimum is 100 paise (₹1)
            currency: "INR",
            receipt: orderNumber.substring(0, 40),
            notes: {
                courseId: course.id,
                courseTitle: course.title.substring(0, 50),
                studentId,
                orderNumber,
                appliedReferralCode: referralCode || "",
                appliedCouponCode: validCouponCode || "",
            },
        });
    } catch (rzpErr) {
        console.error("Razorpay order creation error:", rzpErr);
        throw new Error(
            rzpErr instanceof Error
                ? `Razorpay error: ${rzpErr.message}`
                : "Failed to create Razorpay order"
        );
    }

    // 9. Create or update internal Order record
    let dbOrder;
    if (existingOrder) {
        dbOrder = await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: finalPrice,
                appliedReferralCode: referralCode,
                appliedCouponCode: validCouponCode,
                status: OrderStatus.PENDING,
            },
        });
    } else {
        dbOrder = await prisma.order.create({
            data: {
                studentId,
                courseId: course.id,
                orderNumber,
                amount: finalPrice,
                currency: "INR",
                status: OrderStatus.PENDING,
                razorpayOrderId: razorpayOrder.id,
                appliedReferralCode: referralCode,
                appliedCouponCode: validCouponCode,
            },
        });
    }

    // 9. Return all checkout initiation details
    return {
        orderId: dbOrder.id,
        orderNumber: dbOrder.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: finalPrice,
        amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "",
        course: {
            id: course.id,
            title: course.title,
            thumbnailUrl: course.thumbnailUrl,
        },
    };
};

export const verifyRazorpayWebhookSignature = (
    body: any,
    signature: string,
    secret: string
): boolean => {
    try {
        if (!signature || !secret) {
            return false;
        }
        const bodyString =
            typeof body === "string" ? body : JSON.stringify(body);
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(bodyString)
            .digest("hex");

        if (expectedSignature.length !== signature.length) {
            return false;
        }

        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "utf8"),
            Buffer.from(signature, "utf8")
        );
    } catch {
        return false;
    }
};

export const processRazorpayWebhook = async (
    rawBody: any,
    signature: string
) => {
    const webhookSecret =
        process.env.RAZORPAY_WEBHOOK_SECRET ||
        process.env.RAZORPAY_KEY_SECRET ||
        "";

    if (!webhookSecret) {
        throw new Error("Razorpay webhook secret is not configured on server");
    }

    const isValid = verifyRazorpayWebhookSignature(
        rawBody,
        signature,
        webhookSecret
    );

    if (!isValid) {
        throw new Error("Invalid webhook signature");
    }

    const bodyObj =
        typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    const event = bodyObj?.event;
    const payload = bodyObj?.payload;

    if (!event) {
        throw new Error("Webhook payload missing event type");
    }

    let result: { received: boolean; status: string; [key: string]: any } = {
        received: true,
        status: "ignored",
        event,
    };

    switch (event) {
        case "payment.captured": {
            const paymentEntity = payload?.payment?.entity;
            if (!paymentEntity) {
                return { received: true, status: "missing_payment_entity" };
            }

            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;
            const amountInRupees = Number(paymentEntity.amount) / 100;
            const paymentMethod = paymentEntity.method;

            let order = razorpayOrderId
                ? await prisma.order.findUnique({
                      where: { razorpayOrderId },
                  })
                : null;

            if (!order && paymentEntity.notes?.orderNumber) {
                order = await prisma.order.findUnique({
                    where: { orderNumber: paymentEntity.notes.orderNumber },
                });
            }

            if (!order && paymentEntity.notes?.orderId) {
                order = await prisma.order.findUnique({
                    where: { id: paymentEntity.notes.orderId },
                });
            }

            if (!order) {
                return {
                    received: true,
                    status: "order_not_found",
                    razorpayOrderId,
                };
            }

            const existingPayment = await prisma.payment.findUnique({
                where: { razorpayPaymentId },
            });

            if (existingPayment) {
                if (order.status !== OrderStatus.PAID) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: OrderStatus.PAID },
                    });
                }
                return {
                    received: true,
                    status: "already_processed",
                    orderId: order.id,
                };
            }

            await prisma.$transaction(async (tx) => {
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        studentId: order.studentId,
                        razorpayPaymentId,
                        razorpaySignature: "webhook_verified",
                        amount: amountInRupees,
                        paymentMethod: paymentMethod || "online",
                        rawPayload: payload as any,
                        status: PaymentStatus.CAPTURED,
                    },
                });

                await tx.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.PAID },
                });

                const existingEnrollment = await tx.enrollment.findFirst({
                    where: {
                        studentId: order.studentId,
                        courseId: order.courseId,
                    },
                });

                if (!existingEnrollment) {
                    await tx.enrollment.create({
                        data: {
                            studentId: order.studentId,
                            courseId: order.courseId,
                            orderId: order.id,
                            source: EnrollmentSource.ONLINE_PAYMENT,
                            status: EnrollmentStatus.ACTIVE,
                        },
                    });
                } else if (
                    existingEnrollment.status !== EnrollmentStatus.ACTIVE
                ) {
                    await tx.enrollment.update({
                        where: { id: existingEnrollment.id },
                        data: { status: EnrollmentStatus.ACTIVE },
                    });
                }

                if (order.appliedReferralCode) {
                    const existingCommission =
                        await tx.referralCommission.findUnique({
                            where: { orderId: order.id },
                        });

                    if (!existingCommission) {
                        const referrerProfile =
                            await tx.studentProfile.findUnique({
                                where: {
                                    referralCode: order.appliedReferralCode,
                                },
                            });

                        if (
                            referrerProfile &&
                            referrerProfile.userId !== order.studentId
                        ) {
                            let referral = await tx.referral.findFirst({
                                where: {
                                    referrerStudentId:
                                        referrerProfile.userId,
                                    referredStudentId: order.studentId,
                                },
                            });

                            if (!referral) {
                                referral = await tx.referral.create({
                                    data: {
                                        referrerStudentId:
                                            referrerProfile.userId,
                                        referredStudentId: order.studentId,
                                        referralCodeUsed:
                                            order.appliedReferralCode,
                                    },
                                });
                            }

                            const commissionPercentage = 20.0;
                            const commissionAmount =
                                Number(order.amount) * 0.2;

                            await tx.referralCommission.create({
                                data: {
                                    referralId: referral.id,
                                    orderId: order.id,
                                    referrerStudentId:
                                        referrerProfile.userId,
                                    commissionPercentage,
                                    commissionAmount,
                                    status: CommissionStatus.PENDING,
                                },
                            });
                        }
                    }
                }
            });

            result = {
                received: true,
                status: "payment_captured",
                orderId: order.id,
                razorpayPaymentId,
            };
            break;
        }

        case "order.paid": {
            const orderEntity = payload?.order?.entity;
            if (!orderEntity) {
                return { received: true, status: "missing_order_entity" };
            }

            const razorpayOrderId = orderEntity.id;
            const order = await prisma.order.findUnique({
                where: { razorpayOrderId },
            });

            if (!order) {
                return {
                    received: true,
                    status: "order_not_found",
                    razorpayOrderId,
                };
            }

            if (order.status === OrderStatus.PAID) {
                return {
                    received: true,
                    status: "already_paid",
                    orderId: order.id,
                };
            }

            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.PAID },
                });

                const existingEnrollment = await tx.enrollment.findFirst({
                    where: {
                        studentId: order.studentId,
                        courseId: order.courseId,
                    },
                });

                if (!existingEnrollment) {
                    await tx.enrollment.create({
                        data: {
                            studentId: order.studentId,
                            courseId: order.courseId,
                            orderId: order.id,
                            source: EnrollmentSource.ONLINE_PAYMENT,
                            status: EnrollmentStatus.ACTIVE,
                        },
                    });
                } else if (
                    existingEnrollment.status !== EnrollmentStatus.ACTIVE
                ) {
                    await tx.enrollment.update({
                        where: { id: existingEnrollment.id },
                        data: { status: EnrollmentStatus.ACTIVE },
                    });
                }
            });

            result = {
                received: true,
                status: "order_paid",
                orderId: order.id,
            };
            break;
        }

        case "payment.failed": {
            const paymentEntity = payload?.payment?.entity;
            if (!paymentEntity) {
                return { received: true, status: "missing_payment_entity" };
            }

            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;

            let order = razorpayOrderId
                ? await prisma.order.findUnique({
                      where: { razorpayOrderId },
                  })
                : null;

            if (order && order.status === OrderStatus.PENDING) {
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.FAILED },
                });
            }

            const existingPayment = await prisma.payment.findUnique({
                where: { razorpayPaymentId },
            });

            if (existingPayment) {
                await prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: { status: PaymentStatus.FAILED },
                });
            }

            result = {
                received: true,
                status: "payment_failed",
                orderId: order?.id,
                razorpayPaymentId,
            };
            break;
        }

        case "refund.created":
        case "refund.processed": {
            const refundEntity = payload?.refund?.entity;
            if (!refundEntity) {
                return { received: true, status: "missing_refund_entity" };
            }

            const razorpayPaymentId = refundEntity.payment_id;
            if (razorpayPaymentId) {
                const payment = await prisma.payment.findUnique({
                    where: { razorpayPaymentId },
                    include: { order: true },
                });

                if (payment) {
                    await prisma.$transaction(async (tx) => {
                        await tx.payment.update({
                            where: { id: payment.id },
                            data: { status: PaymentStatus.REFUNDED },
                        });

                        await tx.order.update({
                            where: { id: payment.orderId },
                            data: { status: OrderStatus.REFUNDED },
                        });

                        const enrollment = await tx.enrollment.findFirst({
                            where: {
                                studentId: payment.studentId,
                                courseId: payment.order.courseId,
                            },
                        });

                        if (enrollment) {
                            await tx.enrollment.update({
                                where: { id: enrollment.id },
                                data: { status: EnrollmentStatus.SUSPENDED },
                            });
                        }
                    });
                }
            }

            result = {
                received: true,
                status: "refund_processed",
            };
            break;
        }

        default: {
            result = {
                received: true,
                status: "ignored",
                event,
            };
            break;
        }
    }

    return result;
};