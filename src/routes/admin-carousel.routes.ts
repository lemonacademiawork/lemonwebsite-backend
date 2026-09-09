import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  getAdminCarouselSlidesController,
  getCarouselSlideByIdController,
  createCarouselSlideController,
  updateCarouselSlideController,
  deleteCarouselSlideController,
  reorderCarouselSlidesController,
} from "../controllers/carousel.controller";

const router = Router();

// Protect all admin carousel routes
router.use(authenticate, requireRoles("ADMIN"));

/**
 * @swagger
 * tags:
 *   name: Admin Carousel
 *   description: Administrative management for Hero Carousel & Banner Slides
 */

/**
 * @swagger
 * /api/v1/admin/carousel:
 *   get:
 *     summary: Fetch all slides (active & inactive) for admin management
 *     tags: [Admin Carousel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All carousel slides fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get("/", getAdminCarouselSlidesController);

/**
 * @swagger
 * /api/v1/admin/carousel/reorder:
 *   put:
 *     summary: Bulk update slide order sequence
 *     tags: [Admin Carousel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slides
 *             properties:
 *               slides:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "slide_1"
 *                     order:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid slides array
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.put("/reorder", reorderCarouselSlidesController);

/**
 * @swagger
 * /api/v1/admin/carousel/{id}:
 *   get:
 *     summary: Get single carousel slide by ID
 *     tags: [Admin Carousel]
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
 *         description: Carousel slide fetched successfully
 *       404:
 *         description: Slide not found
 */
router.get("/:id", getCarouselSlideByIdController);

/**
 * @swagger
 * /api/v1/admin/carousel:
 *   post:
 *     summary: Create a new hero banner slide
 *     tags: [Admin Carousel]
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
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Knit. Weave. Express."
 *               tagline:
 *                 type: string
 *                 example: "Artisan Crochet & Fiber Crafts"
 *               description:
 *                 type: string
 *                 example: "Master intricate stitch patterns with step-by-step guidance."
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1200&q=80"
 *               route:
 *                 type: string
 *                 default: "/courses"
 *                 example: "/courses"
 *               category:
 *                 type: string
 *                 example: "crochet-basics"
 *               order:
 *                 type: integer
 *                 default: 0
 *                 example: 6
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Carousel slide created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.post("/", createCarouselSlideController);

/**
 * @swagger
 * /api/v1/admin/carousel/{id}:
 *   patch:
 *     summary: Update slide metadata, image URL, or toggle visibility
 *     tags: [Admin Carousel]
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
 *               title:
 *                 type: string
 *               tagline:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               route:
 *                 type: string
 *               category:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Carousel slide updated successfully
 *       404:
 *         description: Slide not found
 */
router.patch("/:id", updateCarouselSlideController);

/**
 * @swagger
 * /api/v1/admin/carousel/{id}:
 *   delete:
 *     summary: Delete a carousel slide by ID
 *     tags: [Admin Carousel]
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
 *         description: Slide deleted successfully
 *       404:
 *         description: Slide not found
 */
router.delete("/:id", deleteCarouselSlideController);

export default router;
