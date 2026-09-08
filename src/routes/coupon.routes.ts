import { Router } from "express";
import {
    validateCouponController,
    getPublicCouponsController,
    getAllCouponsController,
    getCouponByIdController,
    createCouponController,
    updateCouponController,
    deleteCouponController,
} from "../controllers/coupon.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   post:
 *     summary: Validate and calculate discount for a coupon code
 *     tags:
 *       - Coupons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - amount
 *             properties:
 *               code:
 *                 type: string
 *                 example: LEMON20
 *               amount:
 *                 type: number
 *                 example: 2999
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *     responses:
 *       200:
 *         description: Coupon successfully applied
 *       400:
 *         description: Invalid or expired coupon
 */
router.post("/validate", validateCouponController);

/**
 * @swagger
 * /api/v1/coupons/public:
 *   get:
 *     summary: Get active public promotional coupons
 *     tags:
 *       - Coupons
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter coupons applicable to a specific course
 *     responses:
 *       200:
 *         description: Active coupons retrieved successfully
 */
router.get("/public", getPublicCouponsController);

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Admin get all coupons with pagination and filters
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
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
 *         description: List of coupons
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get(
    "/",
    authenticate,
    requireRoles("ADMIN"),
    getAllCouponsController
);

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Admin create a new discount coupon
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountValue
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER50
 *               description:
 *                 type: string
 *                 example: 50% discount on all craft courses
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FLAT]
 *                 default: PERCENTAGE
 *                 example: PERCENTAGE
 *               discountValue:
 *                 type: number
 *                 example: 50
 *               minOrderAmount:
 *                 type: number
 *                 example: 999
 *               maxDiscountAmount:
 *                 type: number
 *                 example: 1000
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T00:00:00.000Z
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-31T23:59:59.000Z
 *               usageLimit:
 *                 type: integer
 *                 example: 100
 *               perUserLimit:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Invalid input or duplicate coupon code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post(
    "/",
    authenticate,
    requireRoles("ADMIN"),
    createCouponController
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Admin get coupon by ID with usage statistics
 *     tags:
 *       - Coupons
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
 *         description: Coupon details
 *       404:
 *         description: Coupon not found
 */
router.get(
    "/:id",
    authenticate,
    requireRoles("ADMIN"),
    getCouponByIdController
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   patch:
 *     summary: Admin update a coupon
 *     tags:
 *       - Coupons
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
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FLAT]
 *               discountValue:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               usageLimit:
 *                 type: integer
 *               perUserLimit:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       404:
 *         description: Coupon not found
 */
router.patch(
    "/:id",
    authenticate,
    requireRoles("ADMIN"),
    updateCouponController
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   delete:
 *     summary: Admin delete a coupon
 *     tags:
 *       - Coupons
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
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 */
router.delete(
    "/:id",
    authenticate,
    requireRoles("ADMIN"),
    deleteCouponController
);

export default router;
