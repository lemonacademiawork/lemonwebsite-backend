import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createPaymentController, getPaymentsController, getPaymentByIdController } from "../controllers/payment.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Create a payment
 *     description: Creates a payment record for an existing order and marks the order as PAID.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order being paid
 *                 example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *               razorpayPaymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *                 example: "pay_RZP123456"
 *               razorpaySignature:
 *                 type: string
 *                 description: Razorpay payment signature
 *                 example: "abc123signature"
 *               amount:
 *                 type: number
 *                 description: Payment amount in INR
 *                 example: 4999
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method used
 *                 example: "UPI"
 *               rawPayload:
 *                 type: object
 *                 nullable: true
 *                 description: Optional raw payment response
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid payment data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Payment already exists for this order
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticate,
    createPaymentController
);
/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get student's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    authenticate,
    getPaymentsController
);
/**
 * @swagger
 * /api/v1/payments/{paymentId}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment fetched successfully
 *       400:
 *         description: Payment ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:paymentId",
    authenticate,
    getPaymentByIdController
);
export default router;