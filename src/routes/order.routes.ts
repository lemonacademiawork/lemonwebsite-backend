import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createOrderController, getOrdersController, getOrderByIdController } from "../controllers/order.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
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
 *               - orderNumber
 *               - amount
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *               orderNumber:
 *                 type: string
 *                 example: "ORD-2026-0001"
 *               amount:
 *                 type: number
 *                 example: 4999
 *               currency:
 *                 type: string
 *                 example: "INR"
 *               razorpayOrderId:
 *                 type: string
 *                 nullable: true
 *                 example: "order_RZP123456"
 *               appliedReferralCode:
 *                 type: string
 *                 nullable: true
 *                 example: "LEMON10"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Student or course not found
 *       409:
 *         description: Order number already exists
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticate,
    createOrderController
);
/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    authenticate,
    getOrdersController
);
/**
 * @swagger
 * /api/v1/orders/{orderId}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       400:
 *         description: Order ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:orderId",
    authenticate,
    getOrderByIdController
);
export default router;