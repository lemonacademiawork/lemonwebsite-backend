import { Router } from "express";
import { getPublicCarouselSlidesController } from "../controllers/carousel.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Carousel
 *   description: Homepage Hero Carousel and Creative Banner Slide APIs
 */

/**
 * @swagger
 * /api/v1/carousel:
 *   get:
 *     summary: Fetch all active carousel slides for homepage hero section
 *     description: Returns active creative banner slides sorted in ascending order (`order ASC`) for the public homepage hero carousel.
 *     tags: [Carousel]
 *     responses:
 *       200:
 *         description: Carousel slides fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "slide_1"
 *                       title:
 *                         type: string
 *                         example: "Learn. Create. Inspire."
 *                       tagline:
 *                         type: string
 *                         example: "Master the art of Lippan Mirror Work"
 *                       description:
 *                         type: string
 *                         example: "Explore mirror & clay magic in our modern studio classes."
 *                       imageUrl:
 *                         type: string
 *                         example: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80"
 *                       route:
 *                         type: string
 *                         example: "/courses"
 *                       category:
 *                         type: string
 *                         example: "lippan-art"
 *                       order:
 *                         type: integer
 *                         example: 1
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Server error
 */
router.get("/", getPublicCarouselSlidesController);

export default router;
