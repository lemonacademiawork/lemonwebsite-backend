import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
    getMyReferralsController,
    getMyReferralCommissionsController,
    getReferralByIdController,
    validateReferralCodeController,
} from "../controllers/referral.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/referrals/validate/{code}:
 *   get:
 *     summary: Validate a referral code
 *     description: Public endpoint to verify if a referral code is valid prior to checkout.
 *     tags: [Referrals]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral code to validate
 *         example: "REF-ABC123"
 *     responses:
 *       200:
 *         description: Referral code is valid
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
 *                   example: "Referral code is valid"
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     referrer:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         name:
 *                           type: string
 *                           example: "Jane Doe"
 *                         avatarUrl:
 *                           type: string
 *                           nullable: true
 *                           example: "https://example.com/avatar.jpg"
 *                         referralCode:
 *                           type: string
 *                           example: "REF-ABC123"
 *                         isEligibleForReferral:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Referral code is required
 *       404:
 *         description: Invalid referral code
 *       500:
 *         description: Server error
 */
router.get(
    "/validate/:code",
    validateReferralCodeController
);

/**
 * @swagger
 * /api/v1/referrals/me:
 *   get:
 *     summary: Get my referrals
 *     description: Get all students referred by the currently authenticated student.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referrals fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me",
    authenticate,
    getMyReferralsController
);

/**
 * @swagger
 * /api/v1/referrals/me/commissions:
 *   get:
 *     summary: Get my referral commissions
 *     description: Get all commissions earned by the currently authenticated student.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral commissions fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/me/commissions",
    authenticate,
    getMyReferralCommissionsController
);

/**
 * @swagger
 * /api/v1/referrals/{id}:
 *   get:
 *     summary: Get referral by ID
 *     description: Get details of a referral belonging to the currently authenticated student.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral ID
 *     responses:
 *       200:
 *         description: Referral fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Referral not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    authenticate,
    getReferralByIdController
);

export default router;