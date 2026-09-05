import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    createPaymentController,
    getPaymentsController,
    getPaymentByIdController,
    createRazorpayOrderController,
    handleRazorpayWebhookController,
} from "../controllers/payment.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Handle Razorpay webhook event
 *     description: Receives and securely processes server-to-server webhook notifications from Razorpay (such as payment.captured, payment.failed, order.paid, and refund.created). Validates the x-razorpay-signature HMAC SHA256 header using the configured webhook secret, and updates database records idempotently. Does not require JWT authentication.
 *     tags: [Payments]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-razorpay-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay HMAC SHA256 signature generated using your webhook secret
 *         example: "a8f5b4c3d2e1f0...9876543210abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - payload
 *             properties:
 *               entity:
 *                 type: string
 *                 example: "event"
 *               account_id:
 *                 type: string
 *                 example: "acc_1234567890"
 *               event:
 *                 type: string
 *                 enum:
 *                   - payment.captured
 *                   - payment.failed
 *                   - order.paid
 *                   - refund.created
 *                   - refund.processed
 *                 example: "payment.captured"
 *               contains:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["payment"]
 *               payload:
 *                 type: object
 *                 properties:
 *                   payment:
 *                     type: object
 *                     properties:
 *                       entity:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "pay_RZP123456789"
 *                           entity:
 *                             type: string
 *                             example: "payment"
 *                           amount:
 *                             type: number
 *                             description: Amount in paise (499900 = INR 4999.00)
 *                             example: 499900
 *                           currency:
 *                             type: string
 *                             example: "INR"
 *                           status:
 *                             type: string
 *                             example: "captured"
 *                           order_id:
 *                             type: string
 *                             example: "order_RZP123456789"
 *                           method:
 *                             type: string
 *                             example: "upi"
 *                           notes:
 *                             type: object
 *                             properties:
 *                               orderNumber:
 *                                 type: string
 *                                 example: "ORD-1712345678901-AB12C"
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     received:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: "payment_captured"
 *                     orderId:
 *                       type: string
 *                       example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *                     razorpayPaymentId:
 *                       type: string
 *                       example: "pay_RZP123456789"
 *       400:
 *         description: Missing signature header or invalid signature/payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid webhook signature"
 *       500:
 *         description: Server error while processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Internal server error while processing webhook"
 */
router.post(
    "/webhook",
    handleRazorpayWebhookController
);

/**
 * @swagger
 * /api/v1/payments/razorpay-order:
 *   post:
 *     summary: Create Razorpay order for course checkout
 *     description: Creates a new Razorpay order for purchasing a course or retrying an existing order. Automatically fetches and verifies pricing from the database, validates referral codes, creates/updates an internal Order record, and returns all checkout parameters required by Razorpay Frontend SDK.
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
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course to purchase
 *                 example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *               orderId:
 *                 type: string
 *                 nullable: true
 *                 description: Optional existing order ID if retrying an unpaid order
 *                 example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *               appliedReferralCode:
 *                 type: string
 *                 nullable: true
 *                 description: Optional student referral code to apply
 *                 example: "LEMON10"
 *     responses:
 *       201:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Razorpay order created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "a1b2c3d4-e5f6-7890-abcd-123456789012"
 *                     orderNumber:
 *                       type: string
 *                       example: "ORD-1712345678901-AB12C"
 *                     razorpayOrderId:
 *                       type: string
 *                       example: "order_RZP123456789"
 *                     amount:
 *                       type: number
 *                       example: 4999
 *                     amountInPaise:
 *                       type: number
 *                       example: 499900
 *                     currency:
 *                       type: string
 *                       example: "INR"
 *                     keyId:
 *                       type: string
 *                       example: "rzp_test_YourKeyIdHere"
 *                     course:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "f27eaa14-4e8b-4138-8c12-1324ca910e9b"
 *                         title:
 *                           type: string
 *                           example: "Complete Master Crochet Course"
 *                         thumbnailUrl:
 *                           type: string
 *                           nullable: true
 *                           example: "https://images.unsplash.com/photo-1584992236310-6edddc08acff"
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Either courseId or orderId is required"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Authentication required"
 *       404:
 *         description: Course, Student, or Referral code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Course not found"
 *       409:
 *         description: Conflict - student already enrolled or order already paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Student is already enrolled in this course"
 *       500:
 *         description: Server or Razorpay API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to create Razorpay order"
 */
router.post(
    "/razorpay-order",
    authenticate,
    createRazorpayOrderController
);

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