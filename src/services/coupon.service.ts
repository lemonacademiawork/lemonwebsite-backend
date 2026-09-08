import { prisma } from "../config/database";
import { DiscountType } from "@prisma/client";

export interface ValidateCouponInput {
    code: string;
    courseId?: string;
    amount: number;
    userId?: string;
}

export interface CreateCouponInput {
    code: string;
    description?: string;
    discountType?: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: Date | string;
    expiryDate?: Date | string;
    usageLimit?: number;
    perUserLimit?: number;
    courseId?: string;
    isActive?: boolean;
}

export interface UpdateCouponInput {
    code?: string;
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: Date | string | null;
    expiryDate?: Date | string | null;
    usageLimit?: number | null;
    perUserLimit?: number;
    courseId?: string | null;
    isActive?: boolean;
}

export const validateCoupon = async (input: ValidateCouponInput) => {
    const { code, courseId, userId } = input;
    let amount = input.amount;

    if (!code || typeof code !== "string" || !code.trim()) {
        throw new Error("Coupon code is required");
    }

    // If amount is not provided or 0, attempt to get it from courseId
    if ((amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) && courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (course) {
            amount = course.discountedPrice ? Number(course.discountedPrice) : Number(course.price);
        }
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 0) {
        throw new Error("Valid course purchase amount is required");
    }

    const trimmedCode = code.trim();

    // Look up coupon case-insensitively
    const coupon = await prisma.coupon.findFirst({
        where: {
            code: { equals: trimmedCode, mode: "insensitive" },
        },
        include: {
            course: {
                select: { id: true, title: true, slug: true },
            },
        },
    });

    if (!coupon) {
        throw new Error("Invalid coupon code");
    }

    if (!coupon.isActive) {
        throw new Error("This coupon is no longer active");
    }

    const now = new Date();

    // Allow 2-minute clock skew tolerance
    if (coupon.startDate && coupon.startDate.getTime() > (now.getTime() + 2 * 60 * 1000)) {
        throw new Error("This coupon promotion has not started yet");
    }

    if (coupon.expiryDate && coupon.expiryDate < now) {
        throw new Error("This coupon has expired");
    }

    if (coupon.courseId && courseId && coupon.courseId !== courseId) {
        throw new Error(`This coupon is only applicable to course: ${coupon.course?.title || coupon.courseId}`);
    }

    const parsedAmount = Number(amount);
    const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (parsedAmount > 0 && parsedAmount < minOrder) {
        throw new Error(`Minimum order amount for this coupon is ₹${minOrder}`);
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
        throw new Error("This coupon has reached its maximum total usage limit");
    }

    if (userId && coupon.perUserLimit) {
        const userUsageCount = await prisma.couponUsage.count({
            where: {
                couponId: coupon.id,
                userId,
            },
        });

        if (userUsageCount >= coupon.perUserLimit) {
            throw new Error(`You have already used this coupon the maximum allowed times (${coupon.perUserLimit})`);
        }
    }

    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountAmount = (parsedAmount * discountVal) / 100;
        if (coupon.maxDiscountAmount) {
            const maxDiscount = Number(coupon.maxDiscountAmount);
            discountAmount = Math.min(discountAmount, maxDiscount);
        }
    } else {
        discountAmount = Math.min(discountVal, parsedAmount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, Math.round((parsedAmount - discountAmount) * 100) / 100);

    return {
        valid: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0,
            maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
            courseId: coupon.courseId,
            courseTitle: coupon.course?.title || null,
        },
        originalAmount: parsedAmount,
        discountAmount,
        finalAmount,
    };
};

export const createCoupon = async (input: CreateCouponInput) => {
    if (!input.code || !input.code.trim()) {
        throw new Error("Coupon code is required");
    }

    if (input.discountValue === undefined || input.discountValue <= 0) {
        throw new Error("Discount value must be greater than zero");
    }

    const normalizedCode = input.code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
    });

    if (existing) {
        throw new Error(`Coupon with code "${normalizedCode}" already exists`);
    }

    if (input.courseId) {
        const course = await prisma.course.findUnique({
            where: { id: input.courseId },
        });
        if (!course) {
            throw new Error("Specified course not found");
        }
    }

    const coupon = await prisma.coupon.create({
        data: {
            code: normalizedCode,
            description: input.description,
            discountType: input.discountType || DiscountType.PERCENTAGE,
            discountValue: input.discountValue,
            minOrderAmount: input.minOrderAmount ?? 0,
            maxDiscountAmount: input.maxDiscountAmount,
            startDate: input.startDate ? new Date(input.startDate) : new Date(),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            usageLimit: input.usageLimit,
            perUserLimit: input.perUserLimit ?? 1,
            courseId: input.courseId || null,
            isActive: input.isActive ?? true,
        },
        include: {
            course: {
                select: { id: true, title: true, slug: true },
            },
        },
    });

    return coupon;
};

export const getAllCoupons = async (query: {
    isActive?: boolean;
    courseId?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isActive !== undefined) {
        where.isActive = query.isActive;
    }

    if (query.courseId) {
        where.courseId = query.courseId;
    }

    if (query.search) {
        where.OR = [
            { code: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [total, coupons] = await Promise.all([
        prisma.coupon.count({ where }),
        prisma.coupon.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                course: {
                    select: { id: true, title: true, slug: true },
                },
                _count: {
                    select: { usages: true },
                },
            },
        }),
    ]);

    return {
        coupons,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPublicCoupons = async (courseId?: string) => {
    const now = new Date();

    const where: any = {
        isActive: true,
        OR: [
            { expiryDate: null },
            { expiryDate: { gte: now } },
        ],
        AND: [
            {
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } },
                ],
            },
        ],
    };

    if (courseId) {
        where.AND.push({
            OR: [
                { courseId: null },
                { courseId },
            ],
        });
    }

    const coupons = await prisma.coupon.findMany({
        where,
        orderBy: { discountValue: "desc" },
        select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
            minOrderAmount: true,
            maxDiscountAmount: true,
            expiryDate: true,
            course: {
                select: { id: true, title: true, slug: true },
            },
        },
    });

    return coupons;
};

export const getCouponById = async (id: string) => {
    const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
            course: {
                select: { id: true, title: true, slug: true },
            },
            usages: {
                take: 10,
                orderBy: { usedAt: "desc" },
                include: {
                    user: { select: { id: true, name: true, phone: true, email: true } },
                },
            },
            _count: {
                select: { usages: true },
            },
        },
    });

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    return coupon;
};

export const updateCoupon = async (id: string, input: UpdateCouponInput) => {
    const existing = await prisma.coupon.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("Coupon not found");
    }

    if (input.code && input.code.trim().toUpperCase() !== existing.code) {
        const normalizedCode = input.code.trim().toUpperCase();
        const duplicate = await prisma.coupon.findUnique({
            where: { code: normalizedCode },
        });
        if (duplicate) {
            throw new Error(`Coupon code "${normalizedCode}" is already taken`);
        }
    }

    if (input.courseId) {
        const course = await prisma.course.findUnique({
            where: { id: input.courseId },
        });
        if (!course) {
            throw new Error("Specified course not found");
        }
    }

    const updated = await prisma.coupon.update({
        where: { id },
        data: {
            ...(input.code !== undefined && { code: input.code.trim().toUpperCase() }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.discountType !== undefined && { discountType: input.discountType }),
            ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
            ...(input.minOrderAmount !== undefined && { minOrderAmount: input.minOrderAmount }),
            ...(input.maxDiscountAmount !== undefined && { maxDiscountAmount: input.maxDiscountAmount }),
            ...(input.startDate !== undefined && {
                startDate: input.startDate ? new Date(input.startDate) : null,
            }),
            ...(input.expiryDate !== undefined && {
                expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            }),
            ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
            ...(input.perUserLimit !== undefined && { perUserLimit: input.perUserLimit }),
            ...(input.courseId !== undefined && { courseId: input.courseId }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
            course: {
                select: { id: true, title: true, slug: true },
            },
        },
    });

    return updated;
};

export const deleteCoupon = async (id: string) => {
    const existing = await prisma.coupon.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("Coupon not found");
    }

    await prisma.coupon.delete({
        where: { id },
    });

    return {
        message: "Coupon deleted successfully",
    };
};

export const recordCouponUsage = async (data: {
    couponId: string;
    userId: string;
    orderId?: string;
    discountAmount: number;
}) => {
    const [usage] = await prisma.$transaction([
        prisma.couponUsage.create({
            data: {
                couponId: data.couponId,
                userId: data.userId,
                orderId: data.orderId,
                discountAmount: data.discountAmount,
            },
        }),
        prisma.coupon.update({
            where: { id: data.couponId },
            data: {
                usageCount: { increment: 1 },
            },
        }),
    ]);

    return usage;
};
