import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createCertificateController } from "../controllers/certificate.controller";

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

export default router;