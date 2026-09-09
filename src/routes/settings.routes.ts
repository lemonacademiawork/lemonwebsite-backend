import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  getPublicSettingsController,
  getSettingsController,
  updateSettingsController,
} from "../controllers/settings.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System configuration and public dynamic settings APIs
 */

/**
 * @swagger
 * /api/v1/settings/public:
 *   get:
 *     summary: Fetch public settings by key or list public settings
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Optional setting key (e.g. homepage_carousel)
 *     responses:
 *       200:
 *         description: Public setting fetched successfully
 */
router.get("/public", getPublicSettingsController);

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all system settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings list
 */
router.get("/", authenticate, requireRoles("ADMIN"), getSettingsController);

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     summary: Upsert a system setting (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - settingKey
 *               - settingValue
 *             properties:
 *               settingKey:
 *                 type: string
 *                 example: "homepage_carousel"
 *               settingValue:
 *                 type: string
 *                 example: "[{...}]"
 *               description:
 *                 type: string
 *                 example: "Homepage Hero Carousel Slides"
 *     responses:
 *       200:
 *         description: Setting updated successfully
 */
router.put("/", authenticate, requireRoles("ADMIN"), updateSettingsController);

export default router;
