import { Router } from "express";
import {
  createReviewController,
  getCourseReviewsController,
  getMyCourseReviewController,
  getReviewByIdController,
  updateReviewController,
  deleteReviewController,
  getAllReviewsAdminController,
  toggleReviewPublishController,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Course ratings, reviews, and admin moderation
 */

/**
 * @swagger
 * /api/v1/courses/{courseId}/reviews:
 *   get:
 *     summary: Get all published reviews and rating statistics for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 50)
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter reviews by specific star rating (1-5)
 *     responses:
 *       200:
 *         description: Reviews and course statistics fetched successfully
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/:courseId/reviews", getCourseReviewsController);

/**
 * @swagger
 * /api/v1/courses/{courseId}/reviews:
 *   post:
 *     summary: Submit a review and rating for an enrolled course
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Incredible hands-on techniques, beautifully explained by the instructor!"
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Missing fields, invalid rating, or user already reviewed this course
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - student must be enrolled in the course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post("/:courseId/reviews", authenticate, createReviewController);

/**
 * @swagger
 * /api/v1/courses/{courseId}/reviews/my-review:
 *   get:
 *     summary: Get the logged-in student's existing review for a course
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *     responses:
 *       200:
 *         description: Student review fetched successfully (null if not reviewed yet)
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
  "/:courseId/reviews/my-review",
  authenticate,
  getMyCourseReviewController
);

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get all reviews with filters and search (Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews list fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authenticate,
  requireRoles("ADMIN"),
  getAllReviewsAdminController
);

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a review for a course (alternative endpoint with courseId in body)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - rating
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "course-uuid-here"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Outstanding quality and support!"
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Validation error or already reviewed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - student not enrolled
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, createReviewController);

/**
 * @swagger
 * /api/v1/reviews/course/{courseId}:
 *   get:
 *     summary: Get reviews and rating stats for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *     responses:
 *       200:
 *         description: Course reviews fetched successfully
 *       404:
 *         description: Course not found
 */
router.get("/course/:courseId", getCourseReviewsController);

/**
 * @swagger
 * /api/v1/reviews/my-review/{courseId}:
 *   get:
 *     summary: Get logged-in student's review for a course
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get("/my-review/:courseId", authenticate, getMyCourseReviewController);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getReviewByIdController);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   patch:
 *     summary: Update a review (Owner student or Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Updated comment after completing the second module."
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid rating
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - not author and not admin
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", authenticate, updateReviewController);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review (Owner student or Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - not author and not admin
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, deleteReviewController);

/**
 * @swagger
 * /api/v1/reviews/{id}/publish:
 *   patch:
 *     summary: Toggle or set review publication status (Admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Review publish status updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/publish",
  authenticate,
  requireRoles("ADMIN"),
  toggleReviewPublishController
);

export default router;
