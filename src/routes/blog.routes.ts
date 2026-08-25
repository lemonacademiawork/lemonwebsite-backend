import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    createBlogController,
    getBlogsController,
    getBlogByIdController,
    updateBlogController,
    toggleBlogPublishController,
    deleteBlogController
} from "../controllers/blog.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/blogs:
 *   post:
 *     summary: Create a blog
 *     description: Creates a new blog as a draft for the authenticated user.
 *     tags: [Blogs]
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
 *               - content
 *             properties:
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImageUrl:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Blog slug already exists
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticate,
    createBlogController
);
/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blogs fetched successfully
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    getBlogsController
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog fetched successfully
 *       400:
 *         description: Blog ID is required
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    getBlogByIdController
);
/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   patch:
 *     summary: Update a blog
 *     tags: [Blogs]
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
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImageUrl:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blog or category not found
 *       409:
 *         description: Blog slug already exists
 */
router.patch(
    "/:id",
    authenticate,
    updateBlogController
);
/**
 * @swagger
 * /api/v1/blogs/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish a blog
 *     tags: [Blogs]
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
 *         description: Blog publish status updated
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blog not found
 */
router.patch(
    "/:id/publish",
    authenticate,
    toggleBlogPublishController
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
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
 *         description: Blog deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete(
    "/:id",
    authenticate,
    deleteBlogController
);

export default router;