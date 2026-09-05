import { Request, Response } from "express";
import {
    getMyReferrals,
    getMyReferralCommissions,
    getReferralById,
    validateReferralCode,
} from "../services/referral.service";

export const getMyReferralsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const referrals = await getMyReferrals(userId);

        return res.status(200).json({
            success: true,
            message: "Referrals fetched successfully",
            data: referrals,
        });
    } catch (error) {
        console.error("Get my referrals error:", error);

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch referrals",
        });
    }
};

export const getMyReferralCommissionsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const commissions =
            await getMyReferralCommissions(userId);

        return res.status(200).json({
            success: true,
            message: "Referral commissions fetched successfully",
            data: commissions,
        });
    } catch (error) {
        console.error(
            "Get my referral commissions error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch referral commissions",
        });
    }
};

export const getReferralByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const referral = await getReferralById(
            id,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Referral fetched successfully",
            data: referral,
        });
    } catch (error) {
        console.error("Get referral error:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch referral";

        return res.status(
            message === "Referral not found" ? 404 : 500
        ).json({
            success: false,
            message,
        });
    }
};

export const validateReferralCodeController = async (
    req: Request,
    res: Response
) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Referral code is required",
            });
        }

        const data = await validateReferralCode(code.trim());

        return res.status(200).json({
            success: true,
            message: "Referral code is valid",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to validate referral code";

        if (message === "Invalid referral code") {
            return res.status(404).json({
                success: false,
                message: "Invalid referral code",
                data: {
                    valid: false,
                },
            });
        }

        console.error("Validate referral code error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to validate referral code",
        });
    }
};