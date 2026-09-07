import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Helper to get clean from address
 */
const getSenderInfo = () => {
  const rawFrom = (process.env.EMAIL_FROM || "").trim();
  const defaultEmail =
    process.env.SMTP_USER ||
    process.env.BREVO_SMTP_LOGIN ||
    "noreply@lemonacademia.com";

  if (rawFrom) {
    // If format is: "Lemon Academia <user@example.com>"
    const angleMatch = rawFrom.match(/^(.*?)\s*<([^>]+)>$/);
    if (angleMatch) {
      return {
        name: angleMatch[1].replace(/['"]/g, "").trim() || "Lemon Academia",
        email: angleMatch[2].trim(),
      };
    }

    // If format is: "Lemon Academia user@example.com" or just "user@example.com"
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = rawFrom.match(emailRegex);
    if (emailMatch) {
      const extractedEmail = emailMatch[1];
      const extractedName = rawFrom.replace(extractedEmail, "").trim().replace(/['"]/g, "");
      return {
        name: extractedName || "Lemon Academia",
        email: extractedEmail,
      };
    }
  }

  return {
    name: "Lemon Academia",
    email: defaultEmail,
  };
};

/**
 * Configure Nodemailer Transporter (Gmail / Brevo SMTP / Custom SMTP)
 */
const getTransporter = () => {
  const host = (process.env.SMTP_HOST || "").trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = (process.env.SMTP_USER || process.env.BREVO_SMTP_LOGIN || "").trim();
  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.BREVO_SMTP_KEY ||
    process.env.SMTP_PASSWORD ||
    ""
  ).trim();

  // Strip any spaces from password (e.g. Google App Passwords like "zvss ddav uasi janv")
  const pass = rawPass.replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  const isGmail =
    host.includes("gmail") ||
    user.toLowerCase().endsWith("@gmail.com") ||
    (!host && user.includes("@gmail.com"));

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  const actualHost = host || "smtp-relay.brevo.com";

  return nodemailer.createTransport({
    host: actualHost,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: rawPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

/**
 * Send email via Brevo REST API (HTTPS Port 443)
 * Note: Requires a Brevo API key (starts with xkeysib-)
 */
const sendViaBrevoApi = async (
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const apiKey = (process.env.BREVO_API_KEY || "").trim();

  // Brevo API requires an xkeysib- key, not xsmtpsib-
  if (!apiKey || apiKey.startsWith("xsmtpsib-")) {
    return {
      success: false,
      error: "No valid Brevo REST API Key (xkeysib-...) provided",
    };
  }

  const sender = getSenderInfo();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: sender.name,
          email: sender.email,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject,
        htmlContent,
        ...(textContent && { textContent }),
      }),
    });

    const data = (await response.json()) as any;

    if (response.ok && data.messageId) {
      console.log(`✅ [Brevo API] Email sent to ${toEmail} (ID: ${data.messageId})`);
      return { success: true, messageId: data.messageId };
    } else {
      const errorMsg = data.message || JSON.stringify(data);
      console.warn(`⚠️ [Brevo API Response]: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Brevo API Fetch Error]: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
};

/**
 * Send Forgot Password Reset Email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name?: string
): Promise<{ success: boolean; messageId?: string; resetUrl: string; error?: string }> => {
  const frontendUrl = (
    process.env.FRONTEND_URL || "https://course-website-f.vercel.app"
  ).replace(/\/$/, "");

  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
    email
  )}`;

  const recipientName = name || "Learner";
  const sender = getSenderInfo();
  const fromFormatted = `${sender.name} <${sender.email}>`;

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

  const plainText = `Hello ${recipientName},\n\nYou requested a password reset for Lemon Academia.\n\nReset your password here: ${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

  // 1. Try Brevo REST API first (fast & reliable over HTTPS)
  const apiResult = await sendViaBrevoApi(
    email,
    recipientName,
    "🍋 Reset your Lemon Academia Password",
    htmlContent,
    plainText
  );

  if (apiResult.success) {
    return {
      success: true,
      messageId: apiResult.messageId,
      resetUrl,
    };
  }

  // 2. Fallback to Nodemailer SMTP
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`⚠️ [EMAIL SERVICE] SMTP not configured. Reset Link: ${resetUrl}`);
    return {
      success: false,
      resetUrl,
      error: apiResult.error || "SMTP not configured",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromFormatted,
      to: email,
      subject: "🍋 Reset your Lemon Academia Password",
      html: htmlContent,
      text: plainText,
    });

    console.log(`✅ [SMTP] Password reset email sent to ${email} (ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      resetUrl,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send password reset email via SMTP:", errorMsg);

    return {
      success: false,
      resetUrl,
      error: errorMsg,
    };
  }
};

/**
 * Diagnostic helper to test email delivery
 */
export const testEmailDelivery = async (targetEmail: string) => {
  const result = await sendPasswordResetEmail(targetEmail, "test-token-123456", "Test User");
  return result;
};
