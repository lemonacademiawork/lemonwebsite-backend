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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mastering Modern Crochet
 *               slug:
 *                 type: string
 *                 example: mastering-modern-crochet
 *               description:
 *                 type: string
 *                 example: Learn how to crochet modern garments and craft project step by step.
 *               price:
 *                 type: number
 *                 example: 2999
 *               discountedPrice:
 *                 type: number
 *                 example: 1499
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1584992236310-6edddc08acff
 *               categoryId:
 *                 type: string
 *                 example: cat-12345
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Course with this slug already exists
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
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       500:
 *         description: Failed to retrieve courses
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course publish status updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You are not allowed to publish this course
 *       404:
 *         description: Course not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mastering Advanced Crochet
 *               slug:
 *                 type: string
 *                 example: mastering-advanced-crochet
 *               description:
 *                 type: string
 *                 example: Advanced techniques in garment stitching.
 *               price:
 *                 type: number
 *                 example: 3499
 *               discountedPrice:
 *                 type: number
 *                 example: 1999
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1584992236310-6edddc08acff
 *               categoryId:
 *                 type: string
 *                 example: cat-12345
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Course ID is required
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You are not allowed to update this course
 *       404:
 *         description: Course not found
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
 *         description: You are not allowed to delete this course
 *       404:
 *         description: Course not found
 */
router.delete(
    "/:id",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteCourseController
);

export default router;