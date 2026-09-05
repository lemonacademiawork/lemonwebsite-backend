import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  uploadSingleDocument,
  uploadSingleMedia,
} from "../middleware/upload.middleware";
import {
  uploadImageController,
  uploadMultipleImagesController,
  uploadVideoController,
  uploadDocumentController,
  uploadAvatarController,
  uploadMediaController,
  deleteUploadController,
  getUploadSignatureController,
} from "../controllers/upload.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File and Media upload endpoints backed by Cloudinary
 */

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload a single image to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: "courses"
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid image file or missing file
 *       401:
 *         description: Authentication required
 */
router.post(
  "/image",
  authenticate,
  uploadSingleImage("image"),
  uploadImageController
);

/**
 * @swagger
 * /api/v1/upload/images:
 *   post:
 *     summary: Upload multiple images to Cloudinary (up to 10)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 example: "gallery"
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid image files or missing files
 *       401:
 *         description: Authentication required
 */
router.post(
  "/images",
  authenticate,
  uploadMultipleImages("images", 10),
  uploadMultipleImagesController
);

/**
 * @swagger
 * /api/v1/upload/video:
 *   post:
 *     summary: Upload a video to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: "lessons"
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: Invalid video file or missing file
 *       401:
 *         description: Authentication required
 */
router.post(
  "/video",
  authenticate,
  uploadSingleVideo("video"),
  uploadVideoController
);

/**
 * @swagger
 * /api/v1/upload/document:
 *   post:
 *     summary: Upload a document/PDF/raw file to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: "resources"
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid document file or missing file
 *       401:
 *         description: Authentication required
 */
router.post(
  "/document",
  authenticate,
  uploadSingleDocument("file"),
  uploadDocumentController
);

/**
 * @swagger
 * /api/v1/upload/avatar:
 *   post:
 *     summary: Upload and crop a user or trainer avatar to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid avatar file
 *       401:
 *         description: Authentication required
 */
router.post(
  "/avatar",
  authenticate,
  uploadSingleImage("avatar"),
  uploadAvatarController
);

/**
 * @swagger
 * /api/v1/upload/media:
 *   post:
 *     summary: Upload any media file (image, video, PDF) to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: "gallery"
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       400:
 *         description: Invalid media file
 *       401:
 *         description: Authentication required
 */
router.post(
  "/media",
  authenticate,
  uploadSingleMedia("file"),
  uploadMediaController
);

/**
 * @swagger
 * /api/v1/upload/signature:
 *   get:
 *     summary: Generate signed parameters for direct browser-to-Cloudinary upload
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Cloudinary subfolder
 *     responses:
 *       200:
 *         description: Signed params generated successfully
 *       401:
 *         description: Authentication required
 */
router.get("/signature", authenticate, getUploadSignatureController);

/**
 * @swagger
 * /api/v1/upload:
 *   delete:
 *     summary: Delete a file from Cloudinary by public ID
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 example: "lemon_academia/images/sample123"
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *                 default: image
 *     responses:
 *       200:
 *         description: File deleted successfully from Cloudinary
 *       400:
 *         description: Public ID is required
 *       401:
 *         description: Authentication required
 */
router.delete("/", authenticate, deleteUploadController);

export default router;
