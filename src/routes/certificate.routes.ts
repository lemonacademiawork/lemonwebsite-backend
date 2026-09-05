import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createCertificateController,
  getCertificateByCourseController,
  verifyCertificateController,
} from "../controllers/certificate.controller";

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
 * /api/v1/certificates/course/{courseId}:
 *   get:
 *     summary: Get certificate by course ID for authenticated student
 *     description: Retrieve the course completion certificate earned by the logged-in student for a specific course.
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Certificate fetched successfully
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
 *                   example: Certificate fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "660e8400-e29b-41d4-a716-446655440000"
 *                     studentId:
 *                       type: string
 *                       example: "770e8400-e29b-41d4-a716-446655440000"
 *                     courseId:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     certificateNumber:
 *                       type: string
 *                       example: "CERT-1725530000000-1234"
 *                     verificationCode:
 *                       type: string
 *                       example: "VERIFY-1725530000000-A1B2C3"
 *                     issueDate:
 *                       type: string
 *                       format: date-time
 *                     pdfUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "https://res.cloudinary.com/lemon/raw/upload/certificates/cert-123.pdf"
 *                     course:
 *                       type: object
 *                     student:
 *                       type: object
 *       400:
 *         description: Course ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Certificate not found for this course or course not found
 *       500:
 *         description: Server error
 */
router.get(
  "/course/:courseId",
  authenticate,
  getCertificateByCourseController
);

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
 *                   example: Certificate verified successfully
 *                 data:
 *                   type: object
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