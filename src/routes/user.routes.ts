import { Router } from "express";
import {
    getMe,
    updateMe,
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

export default router;