import { prisma } from "../config/database";
import { EnrollmentSource } from "@prisma/client";

interface CreateEnrollmentData {
    courseId: string;
    orderId?: string;
    source?: EnrollmentSource;
}

export const createEnrollment = async (
    studentId: string,
    data: CreateEnrollmentData
) => {
    // 1. Check that the course exists
    const course = await prisma.course.findUnique({
        where: {
            id: data.courseId,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // 2. Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId: data.courseId,
        },
    });

    if (existingEnrollment) {
        throw new Error(
            "Student is already enrolled in this course"
        );
    }

    // 3. If orderId is provided, check the order
    if (data.orderId) {
        const order = await prisma.order.findFirst({
            where: {
                id: data.orderId,
                studentId,
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        // Enrollment is allowed only for a paid order
        if (order.status !== "PAID") {
            throw new Error("Order is not paid");
        }

        // Make sure the order belongs to the same course
        if (order.courseId !== data.courseId) {
            throw new Error(
                "Order does not belong to this course"
            );
        }
    }

    // 4. Create enrollment
    const enrollment = await prisma.enrollment.create({
        data: {
            studentId,
            courseId: data.courseId,
            orderId: data.orderId,
            source: data.source ?? EnrollmentSource.ONLINE_PAYMENT,
            status: "ACTIVE",
        },
        include: {
            course: true,
            order: true,
        },
    });

    return enrollment;
};
export const getEnrollments = async (studentId: string) => {
    const enrollments = await prisma.enrollment.findMany({
        where: {
            studentId,
        },
        include: {
            course: true,
            order: true,
        },
        orderBy: {
            enrolledAt: "desc",
        },
    });

    return enrollments;
};
export const getEnrollmentById = async (
    enrollmentId: string,
    studentId: string
) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            id: enrollmentId,
            studentId,
        },
        include: {
            course: true,
            order: true,
        },
    });

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    return enrollment;
};
export const checkCourseAccess = async (
    studentId: string,
    courseId: string
) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId,
            status: "ACTIVE",
        },
    });

    if (!enrollment) {
        throw new Error("You are not enrolled in this course");
    }

    return enrollment;
};