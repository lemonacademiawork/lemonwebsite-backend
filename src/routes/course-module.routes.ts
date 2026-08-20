import { Router } from "express";

import {
    createCourseModuleController,
    getCourseModulesController,
    updateCourseModuleController,
    deleteCourseModuleController,
    toggleCourseModulePublishController
} from "../controllers/course-module.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules:
 *   post:
 *     summary: Create a course module
 *     tags: [Course Modules]
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
 *                 example: Module 1: Foundations of Crochet
 *               description:
 *                 type: string
 *                 example: Learn yarn weights, hook sizes, and basic stitches.
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Course module created successfully
 *       400:
 *         description: Title or Course ID missing
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to add module
 *       404:
 *         description: Course not found
 */
router.post(
    "/:courseId/modules",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createCourseModuleController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules:
 *   get:
 *     summary: Get all modules of a course
 *     tags: [Course Modules]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course modules retrieved successfully
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found
 */
router.get(
    "/:courseId/modules",
    getCourseModulesController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules/{moduleId}:
 *   patch:
 *     summary: Update a course module
 *     tags: [Course Modules]
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
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Module 1: Crochet Essentials & Yarns
 *               description:
 *                 type: string
 *                 example: Updated module overview.
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Course module updated successfully
 *       400:
 *         description: Missing required IDs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update module
 *       404:
 *         description: Course or Module not found
 */
router.patch(
    "/:courseId/modules/:moduleId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateCourseModuleController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules/{moduleId}:
 *   delete:
 *     summary: Delete a course module
 *     tags: [Course Modules]
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
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Course module deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to delete module
 *       404:
 *         description: Course or Module not found
 */
router.delete(
    "/:courseId/modules/:moduleId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteCourseModuleController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules/{moduleId}/publish:
 *   patch:
 *     summary: Publish or unpublish a course module
 *     tags: [Course Modules]
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
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 *     responses:
 *       200:
 *         description: Module publish status toggled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to publish module
 *       404:
 *         description: Course or Module not found
 */
router.patch(
    "/:courseId/modules/:moduleId/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleCourseModulePublishController
);

export default router;