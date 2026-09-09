import { Router } from "express";
import { handleRazorpayWebhookController } from "../controllers/payment.controller";

const router = Router();

/**
 * @swagger
 * /api/webhooks/razorpay:
 *   post:
 *     summary: Handle Razorpay webhook event
 *     description: Receives and securely processes server-to-server webhook notifications from Razorpay (e.g. payment.captured, payment.failed, order.paid, and refund.created). Validates the x-razorpay-signature HMAC SHA256 header using the configured webhook secret.
 *     tags: [Payments]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-razorpay-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay HMAC SHA256 signature generated using your webhook secret
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
 *                             example: "pay_xyz123456"
 *                           order_id:
 *                             type: string
 *                             example: "order_abc789012"
 *                           amount:
 *                             type: integer
 *                             example: 499900
 *                           status:
 *                             type: string
 *                             example: "captured"
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
 *       400:
 *         description: Bad request / signature verification failed
 *       500:
 *         description: Server error while processing webhook
 */
router.post("/razorpay", handleRazorpayWebhookController);

export default router;
