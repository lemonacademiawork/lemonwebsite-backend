import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    createEnrollmentController, getEnrollmentsController, getEnrollmentByIdController
} from "../controllers/enrollment.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/enrollments:
 *   post:
 *     summary: Create an enrollment
 *     description: Enrolls the authenticated student in a course using a paid order.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *                 example: "course-uuid-here"
 *               orderId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the paid order
 *                 example: "order-uuid-here"
 *               source:
 *                 type: string
 *                 enum:
 *                   - ONLINE_PAYMENT
 *                   - ADMIN
 *                   - MANUAL
 *                 default: ONLINE_PAYMENT
 *                 description: Enrollment source
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *       400:
 *         description: Invalid enrollment request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Course or order not found
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticate,
    createEnrollmentController
);
/**
 * @swagger
 * /api/v1/enrollments:
 *   get:
 *     summary: Get student's enrollments
 *     description: Returns all courses the authenticated student is enrolled in.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    authenticate,
    getEnrollmentsController
);
/**
 * @swagger
 * /api/v1/enrollments/{enrollmentId}:
 *   get:
 *     summary: Get enrollment by ID
 *     description: Returns a specific enrollment belonging to the authenticated student.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment fetched successfully
 *       400:
 *         description: Enrollment ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:enrollmentId",
    authenticate,
    getEnrollmentByIdController
);
export default router;