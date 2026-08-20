import { Router } from "express";
import {
    createBusinessGuidanceController,
    getBusinessGuidanceController,
    updateBusinessGuidanceController,
    deleteBusinessGuidanceController,
    toggleBusinessGuidancePublishController
} from "../controllers/businessGuidance.controller";
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "How to Pricing & Market Your Handmade Soap"
 *               contentType:
 *                 type: string
 *                 example: "PDF"
 *               description:
 *                 type: string
 *                 example: "Step-by-step guidance on pricing, marketing, and distribution for artisans."
 *               resourceUrl:
 *                 type: string
 *                 example: "https://example.com/soap-pricing-guide.pdf"
 *               meetingTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-01T10:00:00.000Z"
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               moduleId:
 *                 type: string
 *                 example: "module-12345"
 *     responses:
 *       201:
 *         description: Business guidance created successfully
 *       400:
 *         description: Title or Course ID missing
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to add guidance to this course
 *       404:
 *         description: Course or module not found
 */
router.post(
    "/:courseId/business-guidance",
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
 *       400:
 *         description: Course ID is required
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Handmade Soap Pricing Strategy"
 *               contentType:
 *                 type: string
 *                 example: "VIDEO"
 *               description:
 *                 type: string
 *                 example: "Updated strategy video for luxury soap packaging."
 *               resourceUrl:
 *                 type: string
 *                 example: "https://example.com/soap-packaging-strategy.mp4"
 *               meetingTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-05T14:00:00.000Z"
 *               orderIndex:
 *                 type: integer
 *                 example: 2
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *               moduleId:
 *                 type: string
 *                 example: "module-12345"
 *     responses:
 *       200:
 *         description: Business guidance updated successfully
 *       400:
 *         description: Course ID or Guidance ID missing
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update business guidance
 *       404:
 *         description: Course or business guidance not found
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
 *     responses:
 *       200:
 *         description: Business guidance deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to delete business guidance
 *       404:
 *         description: Course or business guidance not found
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
 *     responses:
 *       200:
 *         description: Business guidance publish status updated successfully
 *       400:
 *         description: isPublished must be a boolean
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update publish status
 *       404:
 *         description: Course or business guidance not found
 */
router.patch(
    "/:courseId/business-guidance/:guidanceId/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleBusinessGuidancePublishController
);

export default router;