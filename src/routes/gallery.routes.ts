import { Router } from "express";
import {
  createGallerySubmissionController,
  getApprovedGalleryController,
  getMyGallerySubmissionsController,
  getGallerySubmissionByIdController,
  deleteGallerySubmissionController,
  moderateGallerySubmissionController,
  getAllGallerySubmissionsAdminController,
} from "../controllers/gallery.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Student work showcase, project submissions, and admin moderation
 */

/**
 * @swagger
 * /api/v1/gallery:
 *   get:
 *     summary: Get public approved student gallery submissions
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course ID filter
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter only featured submissions
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Approved gallery items fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", getApprovedGalleryController);

/**
 * @swagger
 * /api/v1/courses/{courseId}/gallery:
 *   get:
 *     summary: Get approved student gallery submissions for a specific course
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *     responses:
 *       200:
 *         description: Course gallery submissions fetched successfully
 */
router.get("/courses/:courseId/gallery", getApprovedGalleryController);
router.get("/:courseId/gallery", getApprovedGalleryController);

/**
 * @swagger
 * /api/v1/gallery:
 *   post:
 *     summary: Submit a project or artwork to the gallery (Enrolled student)
 *     tags: [Gallery]
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
 *               - title
 *               - mediaUrl
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "course-uuid-here"
 *               title:
 *                 type: string
 *                 example: "Handmade Scented Botanical Soap Bar"
 *               description:
 *                 type: string
 *                 example: "Created with lavender infusion and goat milk base from Module 2."
 *               mediaUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1607006482602-76ca0fd2f88d"
 *               mediaType:
 *                 type: string
 *                 enum: [IMAGE, VIDEO]
 *                 example: IMAGE
 *     responses:
 *       201:
 *         description: Gallery submission created successfully (pending moderation)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - student not enrolled in course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, createGallerySubmissionController);

/**
 * @swagger
 * /api/v1/courses/{courseId}/gallery:
 *   post:
 *     summary: Submit project to gallery for a specific course
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - mediaUrl
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *               mediaType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gallery submission created successfully
 */
router.post("/:courseId/gallery", authenticate, createGallerySubmissionController);

/**
 * @swagger
 * /api/v1/gallery/my:
 *   get:
 *     summary: Get all gallery submissions created by the logged-in student
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My gallery submissions fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get("/my", authenticate, getMyGallerySubmissionsController);

/**
 * @swagger
 * /api/v1/gallery/admin/submissions:
 *   get:
 *     summary: Get all gallery submissions for moderation (Admin)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Submissions list fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/submissions",
  authenticate,
  requireRoles("ADMIN"),
  getAllGallerySubmissionsAdminController
);

/**
 * @swagger
 * /api/v1/gallery/{id}:
 *   get:
 *     summary: Get single gallery submission by ID
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gallery submission fetched successfully
 *       404:
 *         description: Gallery submission not found
 */
router.get("/:id", getGallerySubmissionByIdController);

/**
 * @swagger
 * /api/v1/gallery/{id}:
 *   delete:
 *     summary: Delete gallery submission (Author student or Admin)
 *     tags: [Gallery]
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
 *         description: Gallery submission deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden - not author and not admin
 *       404:
 *         description: Gallery submission not found
 */
router.delete("/:id", authenticate, deleteGallerySubmissionController);

/**
 * @swagger
 * /api/v1/gallery/{id}/moderate:
 *   patch:
 *     summary: Moderate gallery submission (Approve/Reject/Feature) (Admin)
 *     tags: [Gallery]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               isFeatured:
 *                 type: boolean
 *               adminFeedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gallery submission moderated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Gallery submission not found
 */
router.patch(
  "/:id/moderate",
  authenticate,
  requireRoles("ADMIN"),
  moderateGallerySubmissionController
);

export default router;
