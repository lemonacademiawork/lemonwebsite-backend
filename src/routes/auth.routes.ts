import { Router } from "express";

import {
    register,
    login,
    refresh,
    logout,
    googleLogin,
    googleCallback,
    getMe,
    forgotPasswordController,
    resetPasswordController,
    sendWhatsAppOtpController,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new student account (using phone and/or email)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sejal Agarwal
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: sejal@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or phone/email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with phone number OR email address and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Phone number or email address
 *                 example: "admin@lemonacademy.com"
 *               phone:
 *                 type: string
 *                 description: Alternatively provide phone number directly
 *                 example: "9999999999"
 *               email:
 *                 type: string
 *                 description: Alternatively provide email address directly
 *                 example: "admin@lemonacademy.com"
 *               password:
 *                 type: string
 *                 example: Admin@12345
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid phone number/email or password
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Authentication required or invalid token
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
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
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Authentication required
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects user to Google authentication
 */
router.get("/google", googleLogin);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Google authorization code missing
 *       401:
 *         description: Google authentication failed
 *       500:
 *         description: Internal server error
 */
router.get("/google/callback", googleCallback);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Generate a password reset token by phone number or email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number of the registered user
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 description: Email of the registered user
 *                 example: "student@example.com"
 *               identifier:
 *                 type: string
 *                 description: Phone or email
 *                 example: "admin@lemonacademy.com"
 *     responses:
 *       200:
 *         description: Password reset token generated successfully
 *       400:
 *         description: Phone number or email is required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
    "/forgot-password",
    forgotPasswordController
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     description: Resets the user's password by validating the reset token received via forgot-password. Hashes the new password with bcrypt and invalidates the token to prevent reuse.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Hex reset token received from forgot-password
 *                 example: 3f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 6 characters)
 *                 example: NewSecurePass123!
 *               phone:
 *                 type: string
 *                 description: Optional user phone number
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Optional user email address
 *                 example: student@example.com
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful. You can now log in with your new password.
 *       400:
 *         description: Invalid/expired token or invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired reset token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to reset password
 */
/**
 * @swagger
 * /api/v1/auth/whatsapp/send-otp:
 *   post:
 *     summary: Send 6-digit WhatsApp OTP verification code via ZoePact
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Mobile number with or without country code (e.g. 9876543210 or 919876543210)
 *                 example: "9876543210"
 *               code:
 *                 type: string
 *                 description: Optional specific 6-digit OTP code (otherwise randomly generated)
 *                 example: "262626"
 *     responses:
 *       200:
 *         description: WhatsApp OTP sent successfully
 *       400:
 *         description: Invalid input or missing phone number
 *       502:
 *         description: ZoePact gateway delivery failed
 */
router.post("/whatsapp/send-otp", sendWhatsAppOtpController);
router.post("/whatsapp-otp", sendWhatsAppOtpController);

export default router;