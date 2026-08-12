import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the profile of the currently authenticated user
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

export default router;