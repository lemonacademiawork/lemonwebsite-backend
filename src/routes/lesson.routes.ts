import { Router } from "express";

import {
    createLessonController,
    getLessonsController,
    updateLessonController,
    deleteLessonController,
    toggleLessonPublishController,
} from "../controllers/lesson.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/modules/{moduleId}/lessons:
 *   post:
 *     summary: Create a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 */
router.post(
    "/:moduleId/lessons",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createLessonController
);

/**
 * @swagger
 * /api/v1/modules/{moduleId}/lessons:
 *   get:
 *     summary: Get all lessons in a module
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 */
router.get(
    "/:moduleId/lessons",
    getLessonsController
);

/**
 * @swagger
 * /api/v1/modules/{moduleId}/lessons/{lessonId}/publish:
 *   patch:
 *     summary: Publish or unpublish a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 */
router.patch(
    "/:moduleId/lessons/:lessonId/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleLessonPublishController
);

/**
 * @swagger
 * /api/v1/modules/{moduleId}/lessons/{lessonId}:
 *   patch:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 */
router.patch(
    "/:moduleId/lessons/:lessonId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateLessonController
);

/**
 * @swagger
 * /api/v1/modules/{moduleId}/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Module ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 */
router.delete(
    "/:moduleId/lessons/:lessonId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteLessonController
);

export default router;
