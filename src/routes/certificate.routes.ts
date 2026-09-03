import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createCertificateController, verifyCertificateController } from "../controllers/certificate.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/certificates:
 *   post:
 *     summary: Create a certificate for the logged-in student
 *     tags: [Certificates]
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
 *                 example: "course-uuid-here"
 *     responses:
 *       201:
 *         description: Certificate created successfully
 *       400:
 *         description: Course ID is required or certificate already exists
 *       404:
 *         description: Course not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, createCertificateController);
/**
 * @swagger
 * /api/v1/certificates/verify/{verificationCode}:
 *   get:
 *     summary: Verify a certificate
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate verification code
 *         example: VERIFY-12345
 *     responses:
 *       200:
 *         description: Certificate verified successfully
 *       400:
 *         description: Verification code is required
 *       404:
 *         description: Invalid certificate
 *       500:
 *         description: Server error
 */
router.get(
    "/verify/:verificationCode",
    verifyCertificateController
);
export default router;