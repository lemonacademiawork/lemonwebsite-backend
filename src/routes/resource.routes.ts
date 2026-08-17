import { Router } from "express";

import {
    createResourceController,
    getResourcesController,
    updateResourceController,
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
 */
router.patch(
    "/:courseId/resources/:resourceId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateResourceController
);

export default router;