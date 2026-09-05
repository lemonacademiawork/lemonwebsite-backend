import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
    getAllCoursesController,
    getCourseByIdController,
    getCourseBySlugController,
    getCourseContentController,
    createCourseController,
    updateCourseController,
    deleteCourseController,
    toggleCoursePublishController,
    getCourseEnrollmentStatusController,
    getCourseProgressController,
    reorderCourseModulesController,
    reorderCourseLessonsController,
} from "../controllers/course.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management APIs
 */

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    getAllCoursesController
);

/**
 * @swagger
 * /api/v1/courses/slug/{slug}:
 *   get:
 *     summary: Get course by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly course slug
 *     responses:
 *       200:
 *         description: Course fetched successfully
 *       400:
 *         description: Course slug is required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get(
    "/slug/:slug",
    getCourseBySlugController
);

/**
 * @swagger
 * /api/v1/courses/{id}/content:
 *   get:
 *     summary: Get course content
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course content fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Enrollment required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id/content",
    authenticate,
    getCourseContentController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/enrollment-status:
 *   get:
 *     summary: Get student enrollment status for a course
 *     description: Returns whether the currently authenticated student is enrolled in the specified course, along with enrollment details.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *     responses:
 *       200:
 *         description: Enrollment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Enrollment status retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId:
 *                       type: string
 *                       example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *                     courseTitle:
 *                       type: string
 *                       example: "Complete Master Crochet Course"
 *                     enrolled:
 *                       type: boolean
 *                       example: true
 *                     enrollment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         source:
 *                           type: string
 *                           example: "ONLINE_PAYMENT"
 *                         enrolledAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-01T10:00:00.000Z"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-01T10:00:00.000Z"
 *       400:
 *         description: Course ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course ID is required"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to retrieve enrollment status"
 */
router.get(
    "/:courseId/enrollment-status",
    authenticate,
    getCourseEnrollmentStatusController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/progress:
 *   get:
 *     summary: Get student course progress
 *     description: Returns the authenticated student's completion progress, total lessons, completed lessons, progress percentage, and lesson progress records for the specified course.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *     responses:
 *       200:
 *         description: Course progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course progress retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId:
 *                       type: string
 *                       example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *                     courseTitle:
 *                       type: string
 *                       example: "Complete Master Crochet Course"
 *                     totalLessons:
 *                       type: integer
 *                       example: 12
 *                     completedLessons:
 *                       type: integer
 *                       example: 6
 *                     progressPercentage:
 *                       type: integer
 *                       example: 50
 *                     isCompleted:
 *                       type: boolean
 *                       example: false
 *                     enrollment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *                         status:
 *                           type: string
 *                           example: "ACTIVE"
 *                         enrolledAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-01T10:00:00.000Z"
 *                     progress:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "p1a2b3c4-d5e6-7890-abcd-123456789012"
 *                           lessonId:
 *                             type: string
 *                             example: "l1a2b3c4-d5e6-7890-abcd-123456789012"
 *                           isCompleted:
 *                             type: boolean
 *                             example: true
 *                           watchedSeconds:
 *                             type: integer
 *                             example: 320
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: "2026-03-02T12:00:00.000Z"
 *       400:
 *         description: Course ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course ID is required"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Authentication required"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to retrieve course progress"
 */
router.get(
    "/:courseId/enrollment-status",
    authenticate,
    getCourseEnrollmentStatusController
);

router.get(
    "/:courseId/progress",
    authenticate,
    getCourseProgressController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/modules/reorder:
 *   patch:
 *     summary: Reorder course modules
 *     description: Reorders the modules belonging to a course by updating their orderIndex values. Requires authentication and authorization (Admin or the assigned Trainer for this course).
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modules
 *             properties:
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - orderIndex
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Module UUID
 *                       example: "m1a2b3c4-d5e6-7890-abcd-123456789012"
 *                     orderIndex:
 *                       type: integer
 *                       description: New sequence order position (1-based index)
 *                       example: 1
 *           example:
 *             modules:
 *               - id: "m1a2b3c4-d5e6-7890-abcd-123456789012"
 *                 orderIndex: 1
 *               - id: "m2a2b3c4-d5e6-7890-abcd-123456789012"
 *                 orderIndex: 2
 *     responses:
 *       200:
 *         description: Modules reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Modules reordered successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid module ordering data or duplicate positions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Duplicate order positions found in reorder list"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Authentication required"
 *       403:
 *         description: Forbidden - not authorized to manage modules for this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You are not allowed to manage modules for this course"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to reorder modules"
 */
router.patch(
    "/:courseId/modules/reorder",
    authenticate,
    reorderCourseModulesController
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/reorder:
 *   patch:
 *     summary: Reorder course lessons
 *     description: Reorders lessons across or within modules for a specified course by updating their orderIndex values and optional module associations. Requires authentication and authorization (Admin or the assigned Trainer for this course).
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessons
 *             properties:
 *               lessons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - orderIndex
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Lesson UUID
 *                       example: "l1a2b3c4-d5e6-7890-abcd-123456789012"
 *                     orderIndex:
 *                       type: integer
 *                       description: New sequence order position (1-based index)
 *                       example: 1
 *                     moduleId:
 *                       type: string
 *                       description: Optional parent Module UUID
 *                       example: "m1a2b3c4-d5e6-7890-abcd-123456789012"
 *           example:
 *             lessons:
 *               - id: "l1a2b3c4-d5e6-7890-abcd-123456789012"
 *                 orderIndex: 1
 *                 moduleId: "m1a2b3c4-d5e6-7890-abcd-123456789012"
 *               - id: "l2a2b3c4-d5e6-7890-abcd-123456789012"
 *                 orderIndex: 2
 *                 moduleId: "m1a2b3c4-d5e6-7890-abcd-123456789012"
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lessons reordered successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid lesson ordering data or duplicate positions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Duplicate lesson order positions found within the same module"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Authentication required"
 *       403:
 *         description: Forbidden - not authorized to manage lessons for this course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You are not allowed to manage lessons for this course"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to reorder lessons"
 */
router.patch(
    "/:courseId/lessons/reorder",
    authenticate,
    reorderCourseLessonsController
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course fetched successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    getCourseByIdController
);

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin or trainer access required
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticate,
    createCourseController
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   patch:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin or trainer access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch(
    "/:id",
    authenticate,
    updateCourseController
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin or trainer access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete(
    "/:id",
    authenticate,
    deleteCourseController
);

/**
 * @swagger
 * /api/v1/courses/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course publication status updated
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin or trainer access required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch(
    "/:id/publish",
    authenticate,
    toggleCoursePublishController
);

export default router;