import { Router } from "express";
import {
    register,
    login,
    getMe,
    refresh,
    logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new student account
 *     description: Creates a new user with student profile
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data or email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     description: Authenticates user credentials and returns tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Logged in successfully, returns accessToken and refreshToken
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile token payload
 *     description: Returns current user information from auth token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile data
 *       401:
 *         description: Authentication required or invalid token
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: Generates a new access token using a valid refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out user and invalidate refresh token
 *     description: Clears stored refresh token hash for user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Logout failed
 */
router.post("/logout", authenticate, logout);

export default router;