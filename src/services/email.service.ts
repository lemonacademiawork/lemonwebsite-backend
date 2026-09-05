import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configure Nodemailer Transporter with Brevo SMTP or Generic SMTP
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.BREVO_SMTP_LOGIN || "";
  const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_KEY || process.env.SMTP_PASSWORD || "";

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send Forgot Password Reset Email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name?: string
): Promise<{ success: boolean; messageId?: string; resetUrl: string }> => {
  const frontendUrl = (
    process.env.FRONTEND_URL || "https://course-website-f.vercel.app"
  ).replace(/\/$/, "");

  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
    email
  )}`;

  const transporter = getTransporter();
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.BREVO_SMTP_LOGIN ||
    "Lemon Academia <noreply@lemonacademia.com>";

  const recipientName = name || "Learner";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
          .greeting { font-size: 17px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { background-color: #f59e0b; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3); }
          .button:hover { background-color: #d97706; }
          .link-fallback { background: #f1f5f9; padding: 14px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569; margin-top: 20px; }
          .expiry-notice { color: #dc2626; font-size: 13px; font-weight: 500; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍋 Lemon Academia</h1>
          </div>
          <div class="content">
            <div class="greeting">Hello, ${recipientName}!</div>
            <p>We received a request to reset the password for your Lemon Academia account (<strong>${email}</strong>).</p>
            <p>Click the button below to choose a new password:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" target="_blank" class="button">Reset Password</a>
            </div>

            <p class="expiry-notice">⏱️ This password reset link is valid for <strong>15 minutes</strong>.</p>
            
            <p>If you did not request this password reset, please ignore this email. Your account remains completely secure.</p>
            
            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <div class="link-fallback">${resetUrl}</div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Lemon Academia. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.warn(
      `⚠️ [EMAIL SERVICE] SMTP credentials not configured. Email to ${email} not sent via Brevo.`
    );
    console.warn(`🔗 Reset Password Link: ${resetUrl}`);
    return {
      success: false,
      resetUrl,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "🍋 Reset your Lemon Academia Password",
      html: htmlContent,
      text: `Hello ${recipientName},\n\nYou requested a password reset for Lemon Academia.\n\nReset your password here: ${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
    });

    console.log(`✅ Password reset email sent to ${email} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      resetUrl,
    };
  } catch (error) {
    console.error("❌ Failed to send password reset email via Brevo:", error);
    // Don't throw fatal exception so the API response still proceeds
    return {
      success: false,
      resetUrl,
    };
  }
};
