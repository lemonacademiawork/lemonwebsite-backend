import { Router } from "express";

import {
    createCourseModuleController, getCourseModulesController, updateCourseModuleController, deleteCourseModuleController, toggleCourseModulePublishController
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
 */
router.patch(
    "/:courseId/modules/:moduleId/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleCourseModulePublishController
);
export default router;