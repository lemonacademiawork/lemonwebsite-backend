import { Router } from "express";
import {
    submitTrainerRequestController,
    getMyTrainerRequestsController,
    getAllTrainerRequestsController,
    getTrainerRequestByIdController,
    updateTrainerRequestStatusController,
    deleteTrainerRequestController,
} from "../controllers/trainerRequest.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/trainer-requests:
 *   post:
 *     summary: Submit an application to become a trainer / instructor
 *     tags:
 *       - Trainer Applications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - expertise
 *             properties:
 *               name:
 *                 type: string
 *                 example: Priya Sharma
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: priya@example.com
 *               expertise:
 *                 type: string
 *                 example: Modern Crochet & Amigurumi
 *               experienceYears:
 *                 type: integer
 *                 example: 6
 *               bio:
 *                 type: string
 *                 example: Certified fiber artist with 6 years of experience running craft workshops.
 *               portfolioUrl:
 *                 type: string
 *                 example: https://instagram.com/crochet_priya
 *               sampleVideoUrl:
 *                 type: string
 *                 example: https://youtube.com/watch?v=sample123
 *               resumeUrl:
 *                 type: string
 *                 example: https://drive.google.com/file/d/sample
 *     responses:
 *       201:
 *         description: Trainer application submitted successfully
 *       400:
 *         description: Invalid input or pending application already exists
 */
router.post(
    "/",
    (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authenticate(req, res, next);
        }
        next();
    },
    submitTrainerRequestController
);

/**
 * @swagger
 * /api/v1/trainer-requests/me:
 *   get:
 *     summary: Get current authenticated user's trainer applications
 *     tags:
 *       - Trainer Applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submitted trainer applications
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/me",
    authenticate,
    getMyTrainerRequestsController
);

/**
 * @swagger
 * /api/v1/trainer-requests:
 *   get:
 *     summary: Admin get all trainer applications with filters and pagination
 *     tags:
 *       - Trainer Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of trainer applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
    "/",
    authenticate,
    requireRoles("ADMIN"),
    getAllTrainerRequestsController
);

/**
 * @swagger
 * /api/v1/trainer-requests/{id}:
 *   get:
 *     summary: Admin get trainer application by ID
 *     tags:
 *       - Trainer Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Application not found
 */
router.get(
    "/:id",
    authenticate,
    requireRoles("ADMIN"),
    getTrainerRequestByIdController
);

/**
 * @swagger
 * /api/v1/trainer-requests/{id}/status:
 *   patch:
 *     summary: Admin review (approve/reject) a trainer application
 *     tags:
 *       - Trainer Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: APPROVED
 *               adminNotes:
 *                 type: string
 *                 example: Approved after video review. Invited to course creation portal.
 *     responses:
 *       200:
 *         description: Trainer application updated. If APPROVED, user role is elevated to TRAINER.
 *       400:
 *         description: Invalid status or request
 *       404:
 *         description: Application not found
 */
router.patch(
    "/:id/status",
    authenticate,
    requireRoles("ADMIN"),
    updateTrainerRequestStatusController
);

/**
 * @swagger
 * /api/v1/trainer-requests/{id}:
 *   delete:
 *     summary: Admin delete a trainer application
 *     tags:
 *       - Trainer Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 */
router.delete(
    "/:id",
    authenticate,
    requireRoles("ADMIN"),
    deleteTrainerRequestController
);

export default router;
