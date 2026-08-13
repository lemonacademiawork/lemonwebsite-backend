import { Router } from "express";
import {
    createCourseController,
    getAllCoursesController,
    getCourseByIdController, updateCourseController
} from "../controllers/course.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Courses
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
 *                 example: Complete Web Development
 *               slug:
 *                 type: string
 *                 example: complete-web-development
 *               description:
 *                 type: string
 *                 example: Learn full-stack web development from beginner to advanced.
 *               price:
 *                 type: number
 *                 example: 4999
 *               discountedPrice:
 *                 type: number
 *                 example: 3499
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/course.jpg
 *               categoryId:
 *                 type: string
 *                 example: category-uuid
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Invalid course data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
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
 *     tags:
 *       - Courses
 *     responses:
 *       200:
 *         description: Published courses retrieved successfully
 *       500:
 *         description: Failed to retrieve courses
 */
router.get("/", getAllCoursesController);
/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 */
router.get("/:id", getCourseByIdController);
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

export default router;