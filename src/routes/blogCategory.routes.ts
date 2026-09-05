import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    createBlogCategoryController,
    getBlogCategoriesController,
    getBlogCategoryBySlugController,
    getBlogCategoryByIdController,
    updateBlogCategoryController,
    deleteBlogCategoryController,
} from "../controllers/blogCategory.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/blog-categories:
 *   post:
 *     summary: Create a blog category
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog category created successfully
 *       400:
 *         description: Name and slug are required
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Category already exists
 */
router.post(
    "/",
    authenticate,
    createBlogCategoryController
);
/**
 * @swagger
 * /api/v1/blog-categories:
 *   get:
 *     summary: Get all blog categories
 *     description: Fetch all blog categories ordered by creation date.
 *     tags: [Blog Categories]
 *     responses:
 *       200:
 *         description: Blog categories fetched successfully
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
 *                   example: Blog categories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       name:
 *                         type: string
 *                         example: Technology
 *                       slug:
 *                         type: string
 *                         example: technology
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: Technology related articles
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    getBlogCategoriesController
);

/**
 * @swagger
 * /api/v1/blog-categories/slug/{slug}:
 *   get:
 *     summary: Get blog category by slug
 *     description: Retrieve details of a specific blog category by its unique URL slug.
 *     tags: [Blog Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique slug of the blog category
 *         example: technology
 *     responses:
 *       200:
 *         description: Blog category fetched successfully
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
 *                   example: Blog category fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     name:
 *                       type: string
 *                       example: Technology
 *                     slug:
 *                       type: string
 *                       example: technology
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: Technology related articles
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     blogs:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Category slug is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Category slug is required
 *       404:
 *         description: Blog category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Blog category not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch blog category
 */
router.get(
    "/slug/:slug",
    getBlogCategoryBySlugController
);

/**
 * @swagger
 * /api/v1/blog-categories/{id}:
 *   get:
 *     summary: Get blog category by ID
 *     tags: [Blog Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog category fetched successfully
 *       400:
 *         description: Category ID is required
 *       404:
 *         description: Blog category not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    getBlogCategoryByIdController
);
/**
 * @swagger
 * /api/v1/blog-categories/{id}:
 *   patch:
 *     summary: Update a blog category
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog category updated successfully
 *       400:
 *         description: Category ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blog category not found
 *       409:
 *         description: Category name or slug already exists
 *       500:
 *         description: Server error
 */
router.patch(
    "/:id",
    authenticate,
    updateBlogCategoryController
);
/**
 * @swagger
 * /api/v1/blog-categories/{id}:
 *   delete:
 *     summary: Delete a blog category
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog category deleted successfully
 *       400:
 *         description: Category ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blog category not found
 *       409:
 *         description: Category has associated blogs
 *       500:
 *         description: Server error
 */
router.delete(
    "/:id",
    authenticate,
    deleteBlogCategoryController
);
export default router;