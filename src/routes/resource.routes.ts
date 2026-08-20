import { Router } from "express";

import {
    createResourceController,
    getResourcesController,
    updateResourceController,
    deleteResourceController
} from "../controllers/resource.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/courses/{courseId}/resources:
 *   post:
 *     summary: Create a resource
 *     tags: [Resources]
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
 *               - fileUrl
 *               - fileType
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Sourdough Starter Measurement Chart PDF"
 *               fileUrl:
 *                 type: string
 *                 example: "https://example.com/downloads/starter-chart.pdf"
 *               fileType:
 *                 type: string
 *                 example: "PDF"
 *               fileSize:
 *                 type: integer
 *                 example: 1048576
 *               lessonId:
 *                 type: string
 *                 example: "lesson-12345"
 *               procedureId:
 *                 type: string
 *                 example: "procedure-12345"
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to add resource
 *       404:
 *         description: Course or linked lesson/procedure not found
 */
router.post(
    "/:courseId/resources",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createResourceController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/resources:
 *   get:
 *     summary: Get all resources of a course
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found
 */
router.get(
    "/:courseId/resources",
    getResourcesController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/resources/{resourceId}:
 *   patch:
 *     summary: Update a resource
 *     tags: [Resources]
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
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Sourdough Starter Chart"
 *               fileUrl:
 *                 type: string
 *                 example: "https://example.com/downloads/starter-chart-v2.pdf"
 *               fileType:
 *                 type: string
 *                 example: "PDF"
 *               fileSize:
 *                 type: integer
 *                 example: 2097152
 *               lessonId:
 *                 type: string
 *                 example: lesson-12345
 *               procedureId:
 *                 type: string
 *                 example: procedure-12345
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       400:
 *         description: Missing IDs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update resource
 *       404:
 *         description: Course or Resource not found
 */
router.patch(
    "/:courseId/resources/:resourceId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateResourceController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/resources/{resourceId}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
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
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to delete resource
 *       404:
 *         description: Course or Resource not found
 */
router.delete(
    "/:courseId/resources/:resourceId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteResourceController
);

export default router;