import { Router } from "express";

import {
    createCourseController,
    getAllCoursesController,
    getCourseByIdController,
    updateCourseController,
    deleteCourseController,
    toggleCoursePublishController,
} from "../controllers/course.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createCourseController
);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 */
router.get(
    "/",
    getAllCoursesController
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 */
router.get(
    "/:id",
    getCourseByIdController
);

/**
 * @swagger
 * /api/v1/courses/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id/publish",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    toggleCoursePublishController
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   patch:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
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
 */
router.delete(
    "/:id",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteCourseController
);

export default router;