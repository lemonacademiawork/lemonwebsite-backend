import { Router } from "express";
import { createBusinessGuidanceController, getBusinessGuidanceController, updateBusinessGuidanceController, deleteBusinessGuidanceController, toggleBusinessGuidancePublishController } from "../controllers/businessGuidance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
const router = Router();
/**
 * @swagger
 * /api/v1/courses/{courseId}/business-guidance:
 *   post:
 *     summary: Create business guidance
 *     tags: [Business Guidance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 */
router.post("/:courseId/business-guidance",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createBusinessGuidanceController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/business-guidance:
 *   get:
 *     summary: Get business guidance for a course
 *     tags: [Business Guidance]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Business guidance fetched successfully
 *       404:
 *         description: Course not found
 */
router.get(
    "/:courseId/business-guidance",
    getBusinessGuidanceController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/business-guidance/{guidanceId}:
 *   patch:
 *     summary: Update business guidance
 *     tags: [Business Guidance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: guidanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business Guidance ID
 */
router.patch(
    "/:courseId/business-guidance/:guidanceId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateBusinessGuidanceController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/business-guidance/{guidanceId}:
 *   delete:
 *     summary: Delete business guidance
 *     tags: [Business Guidance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: guidanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business Guidance ID
 */
router.delete(
    "/:courseId/business-guidance/:guidanceId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteBusinessGuidanceController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/business-guidance/{guidanceId}/publish:
 *   patch:
 *     summary: Publish or unpublish business guidance
 *     tags: [Business Guidance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: guidanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business Guidance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 example: true
 */
router.patch(
    "/:courseId/business-guidance/:guidanceId/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleBusinessGuidancePublishController
);
export default router;