import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    getMyProfileController,
    updateMyProfileController,
    getMyEnrollmentsController, getMyPaymentsController, getMyDashboardController, getMyProgressController, updateMyProgressController, getMyCertificatesController, getMyNotificationsController, markNotificationAsReadController,
} from "../controllers/student.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/students/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
    "/me",
    authenticate,
    getMyProfileController
);

/**
 * @swagger
 * /api/v1/students/me:
 *   patch:
 *     summary: Update my profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sejal Agarwal
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               bio:
 *                 type: string
 *                 example: Full Stack Developer
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Student profile not found
 *       500:
 *         description: Server error
 */
router.patch(
    "/me",
    authenticate,
    updateMyProfileController
);

/**
 * @swagger
 * /api/v1/students/me/enrollments:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Students]
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
    "/me/enrollments",
    authenticate,
    getMyEnrollmentsController
);
/**
 * @swagger
 * /api/v1/students/me/payments:
 *   get:
 *     summary: Get my payments
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/payments",
    authenticate,
    getMyPaymentsController
);
/**
 * @swagger
 * /api/v1/students/me/dashboard:
 *   get:
 *     summary: Get my student dashboard
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Student profile not found
 *       500:
 *         description: Server error
 */
router.get(
    "/me/dashboard",
    authenticate,
    getMyDashboardController
);
/**
 * @swagger
 * /api/v1/students/me/progress:
 *   get:
 *     summary: Get my course progress
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/progress",
    authenticate,
    getMyProgressController
);
/**
 * @swagger
 * /api/v1/students/me/progress/{lessonId}:
 *   patch:
 *     summary: Update my lesson progress
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               watchedSeconds:
 *                 type: integer
 *                 example: 120
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Lesson not found or student not enrolled
 *       500:
 *         description: Server error
 */
router.patch(
    "/me/progress/:lessonId",
    authenticate,
    updateMyProgressController
);
/**
 * @swagger
 * /api/v1/students/me/certificates:
 *   get:
 *     summary: Get my certificates
 *     tags: [Students, Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/certificates",
    authenticate,
    getMyCertificatesController
);
/**
 * @swagger
 * /api/v1/students/me/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/notifications",
    authenticate,
    getMyNotificationsController
);
/**
 * @swagger
 * /api/v1/students/me/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch(
    "/me/notifications/:notificationId/read",
    authenticate,
    markNotificationAsReadController
);
router.get(
    "/me/progress",
    authenticate,
    getMyProgressController
);
export default router;