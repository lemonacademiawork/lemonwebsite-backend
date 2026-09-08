import dotenv from "dotenv";

dotenv.config();

const ZOEPACT_API_URL = process.env.ZOEPACT_API_URL || "https://app.zoepact.in/api/v1/whatsapp/send/template";
const ZOEPACT_API_TOKEN = process.env.ZOEPACT_API_TOKEN || "21450|mVe7wuYJJ5XiHer6urI6FB7GLDWX35IfUiquvoUi4e1dbcf8";
const ZOEPACT_PHONE_NUMBER_ID = process.env.ZOEPACT_PHONE_NUMBER_ID || "907019455832591";
const ZOEPACT_OTP_TEMPLATE_ID = process.env.ZOEPACT_OTP_TEMPLATE_ID || "401355";

/**
 * Format phone number to E.164 without leading plus (e.g. 919876543210)
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/\D/g, "");
    // If standard 10 digit Indian mobile number, prefix with 91
    if (cleaned.length === 10) {
        cleaned = `91${cleaned}`;
    }
    return cleaned;
};

export interface SendWhatsAppTemplateOptions {
    phoneNumber: string;
    templateId?: string;
    code?: string;
    variables?: Record<string, string>;
}

export interface WhatsAppSendResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Send WhatsApp OTP / Code template via ZoePact API
 */
export const sendWhatsAppOTP = async (
    phoneNumber: string,
    code: string,
    templateId: string = ZOEPACT_OTP_TEMPLATE_ID
): Promise<WhatsAppSendResult> => {
    try {
        const formattedNumber = formatWhatsAppNumber(phoneNumber);

        const params = new URLSearchParams();
        params.append("apiToken", ZOEPACT_API_TOKEN);
        params.append("phone_number_id", ZOEPACT_PHONE_NUMBER_ID);
        params.append("template_id", templateId);
        params.append("templateVariable-code-1", code);
        params.append("phone_number", formattedNumber);

        const response = await fetch(ZOEPACT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data: any = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("ZoePact WhatsApp API error:", data || response.statusText);
            return {
                success: false,
                error: (data && (data.message || data.error)) || `ZoePact HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (err) {
        console.error("Failed to send WhatsApp message via ZoePact:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to send WhatsApp message",
        };
    }
};

/**
 * Generic WhatsApp template sender via ZoePact
 */
export const sendWhatsAppTemplate = async (
    options: SendWhatsAppTemplateOptions
): Promise<WhatsAppSendResult> => {
    try {
        const formattedNumber = formatWhatsAppNumber(options.phoneNumber);

        const params = new URLSearchParams();
        params.append("apiToken", ZOEPACT_API_TOKEN);
        params.append("phone_number_id", ZOEPACT_PHONE_NUMBER_ID);
        params.append("template_id", options.templateId || ZOEPACT_OTP_TEMPLATE_ID);
        params.append("phone_number", formattedNumber);

        if (options.code) {
            params.append("templateVariable-code-1", options.code);
        }

        if (options.variables) {
            for (const [key, value] of Object.entries(options.variables)) {
                params.append(key, value);
            }
        }

        const response = await fetch(ZOEPACT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data: any = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("ZoePact WhatsApp API error:", data || response.statusText);
            return {
                success: false,
                error: (data && (data.message || data.error)) || `ZoePact HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (err) {
        console.error("Failed to send WhatsApp template:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to send WhatsApp template",
        };
    }
};
