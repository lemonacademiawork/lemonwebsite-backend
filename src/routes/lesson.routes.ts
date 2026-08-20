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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - videoId
 *               - videoUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: Single & Double Crochet Mastery
 *               description:
 *                 type: string
 *                 example: Detailed tutorial on height consistency and yarn tension.
 *               videoProvider:
 *                 type: string
 *                 example: CLOUDINARY
 *               videoId:
 *                 type: string
 *                 example: v1620000000/crochet_stitches
 *               videoUrl:
 *                 type: string
 *                 example: https://example.com/crochet_stitches.mp4
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/thumb.jpg
 *               durationSeconds:
 *                 type: integer
 *                 example: 680
 *               fileSizeBytes:
 *                 type: integer
 *                 example: 52428800
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               isPreview:
 *                 type: boolean
 *                 example: false
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Required fields or Module ID missing
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to add lesson
 *       404:
 *         description: Module not found
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
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 *       400:
 *         description: Module ID is required
 *       404:
 *         description: Module not found
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
 *     responses:
 *       200:
 *         description: Lesson publish status toggled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to publish lesson
 *       404:
 *         description: Module or Lesson not found
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Advanced Crochet Stitches Mastery
 *               description:
 *                 type: string
 *                 example: Updated lesson descriptions.
 *               videoProvider:
 *                 type: string
 *                 example: CLOUDINARY
 *               videoId:
 *                 type: string
 *                 example: v1620000000/crochet_stitches_v2
 *               videoUrl:
 *                 type: string
 *                 example: https://example.com/crochet_stitches_v2.mp4
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/thumb_v2.jpg
 *               durationSeconds:
 *                 type: integer
 *                 example: 720
 *               fileSizeBytes:
 *                 type: integer
 *                 example: 62914560
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               isPreview:
 *                 type: boolean
 *                 example: true
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       400:
 *         description: Missing required IDs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update lesson
 *       404:
 *         description: Module or Lesson not found
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
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to delete lesson
 *       404:
 *         description: Module or Lesson not found
 */
router.delete(
    "/:moduleId/lessons/:lessonId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteLessonController
);

export default router;
