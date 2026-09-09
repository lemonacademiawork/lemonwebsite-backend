import { Router } from "express";
import {
    getMe,
    updateMe,
    changePasswordController,
    getMyNotificationsController,
    markNotificationAsReadController,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update current student's profile
 *     tags:
 *       - Users
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
 *               bio:
 *                 type: string
 *                 example: Computer Science student
 *               avatarUrl:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required or invalid token
 *       404:
 *         description: User or student profile not found
 */
router.patch("/me", authenticate, updateMe);
/**
 * @swagger
 * /api/v1/users/me/password:
 *   patch:
 *     summary: Change current user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch(
    "/me/password",
    authenticate,
    changePasswordController
);

/**
 * @swagger
 * /api/v1/users/me/notifications:
 *   get:
 *     summary: Get all notifications for current user (student/trainer)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */
router.get("/me/notifications", authenticate, getMyNotificationsController);

/**
 * @swagger
 * /api/v1/users/me/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch(
    "/me/notifications/:notificationId/read",
    authenticate,
    markNotificationAsReadController
);

export default router;