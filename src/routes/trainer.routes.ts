import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    getMyTrainerProfileController,
    updateMyTrainerProfileController,
    getMyTrainerCoursesController,
    getMyTrainerDashboardController,
    getMyTrainerStudentsController,
    getMyTrainerBusinessGuidanceController,
    getMyTrainerReviewsController,
    getMyTrainerGallerySubmissionsController,
    updateTrainerGalleryFeedbackController,
} from "../controllers/trainer.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/trainers/me:
 *   get:
 *     summary: Get my trainer profile
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer profile fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Trainer profile not found
 */
router.get(
    "/me",
    authenticate,
    getMyTrainerProfileController
);

/**
 * @swagger
 * /api/v1/trainers/me:
 *   patch:
 *     summary: Update my trainer profile
 *     tags: [Trainers]
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
 *               phone:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               bio:
 *                 type: string
 *               expertise:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trainer profile updated successfully
 *       401:
 *         description: Authentication required
 */
router.patch(
    "/me",
    authenticate,
    updateMyTrainerProfileController
);

/**
 * @swagger
 * /api/v1/trainers/me/courses:
 *   get:
 *     summary: Get all courses taught by the logged-in trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer courses fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/courses",
    authenticate,
    getMyTrainerCoursesController
);

/**
 * @swagger
 * /api/v1/trainers/me/dashboard:
 *   get:
 *     summary: Get trainer dashboard metrics and overview
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer dashboard fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/dashboard",
    authenticate,
    getMyTrainerDashboardController
);

/**
 * @swagger
 * /api/v1/trainers/me/students:
 *   get:
 *     summary: Get all students enrolled in courses taught by the trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer students fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/students",
    authenticate,
    getMyTrainerStudentsController
);

/**
 * @swagger
 * /api/v1/trainers/me/business-guidance:
 *   get:
 *     summary: Get all business guidance sessions/materials by the trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer business guidance fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/business-guidance",
    authenticate,
    getMyTrainerBusinessGuidanceController
);

/**
 * @swagger
 * /api/v1/trainers/me/reviews:
 *   get:
 *     summary: Get student reviews for courses taught by the trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer course reviews fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/reviews",
    authenticate,
    getMyTrainerReviewsController
);

/**
 * @swagger
 * /api/v1/trainers/me/gallery-submissions:
 *   get:
 *     summary: Get student gallery submissions for courses taught by the trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer gallery submissions fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/gallery-submissions",
    authenticate,
    getMyTrainerGallerySubmissionsController
);

/**
 * @swagger
 * /api/v1/trainers/me/gallery-submissions/{id}/feedback:
 *   patch:
 *     summary: Provide trainer feedback on a student gallery submission
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gallery submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *                 example: Great technique and precision on this step!
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error or submission not found
 *       401:
 *         description: Authentication required
 */
router.patch(
    "/me/gallery-submissions/:id/feedback",
    authenticate,
    updateTrainerGalleryFeedbackController
);

export default router;