import { Request, Response } from "express";
import { registerUser, loginUser, refreshUser, logoutUser, resetPassword, forgotPassword, loginWithGoogle } from "../services/auth.service";
import { googleClient } from "../config/google";

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, email, password } = req.body;

        if ((!phone && !email) || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email, and password are required",
            });
        }

        const user = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Registration failed",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, email, identifier, password } = req.body;
        const loginIdentifier = phone || email || identifier;

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email, and password are required",
            });
        }

        const result = await loginUser(loginIdentifier, password);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Login failed",
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Authenticated user",
        data: {
            user: req.user,
        },
    });
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const result = await refreshUser(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Invalid or expired refresh token",
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        await logoutUser(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Logout failed",
        });
    }
};

export const googleLogin = (req: Request, res: Response) => {
    const authorizationUrl = googleClient.generateAuthUrl({
        access_type: "offline",
        scope: [
            "openid",
            "email",
            "profile",
        ],
        prompt: "consent",
    });

    return res.redirect(authorizationUrl);
};

export const googleCallback = async (
    req: Request,
    res: Response
) => {
    try {
        const { code } = req.query;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                success: false,
                message: "Google authorization code is missing",
            });
        }

        // Exchange Google authorization code for tokens
        const { tokens } = await googleClient.getToken(code);

        if (!tokens.id_token) {
            return res.status(401).json({
                success: false,
                message: "Google authentication failed",
            });
        }

        // Verify Google's ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: "Unable to get Google user information",
            });
        }

        // Get verified Google user information
        const googleName =
            payload.name ||
            [payload.given_name, payload.family_name]
                .filter(Boolean)
                .join(" ") ||
            "Student";

        const googleUser = {
            googleId: payload.sub,
            email: payload.email,
            name: googleName,
        };

        // Login/create user in our database
        const result = await loginWithGoogle(googleUser);

        const frontendUrl = (process.env.FRONTEND_URL || "https://course-website-f.vercel.app").replace(/\/$/, "");
        const acceptHeader = req.headers.accept || "";

        // If this was triggered via standard browser redirect, send user back to frontend with tokens
        if (acceptHeader.includes("text/html") || !req.xhr) {
            return res.redirect(
                `${frontendUrl}/oauth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}&role=${result.user.role}`
            );
        }

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            data: result,
        });
    } catch (error) {
        console.error("Google callback error:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Google authentication failed";

        const frontendUrl = (process.env.FRONTEND_URL || "https://course-website-f.vercel.app").replace(/\/$/, "");
        const acceptHeader = req.headers.accept || "";

        if (acceptHeader.includes("text/html") || !req.xhr) {
            return res.redirect(
                `${frontendUrl}/login?error=${encodeURIComponent(message)}`
            );
        }

        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const forgotPasswordController = async (
    req: Request,
    res: Response
) => {
    try {
        const { phone, email, identifier } = req.body;
        const resetIdentifier = phone || email || identifier;

        if (!resetIdentifier) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email is required",
            });
        }

        const result = await forgotPassword(resetIdentifier);

        return res.status(200).json({
            success: true,
            message: "Password reset token generated successfully",
            data: result,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to process forgot password request";

        if (message === "User not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request",
        });
    }
};

export const resetPasswordController = async (
    req: Request,
    res: Response
) => {
    try {
        const { token, newPassword, phone, email } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and newPassword are required",
            });
        }

        const result = await resetPassword({ token, newPassword, phone, email });

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to reset password";

        if (
            message === "Invalid or expired reset token" ||
            message === "Reset token has expired" ||
            message === "Password must be at least 6 characters long" ||
            message === "Reset token is required" ||
            message === "Your account is inactive"
        ) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        if (message === "User not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }

        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};