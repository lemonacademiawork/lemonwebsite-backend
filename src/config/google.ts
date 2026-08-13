import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_CALLBACK_URL;

if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is missing from environment variables");
}

if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is missing from environment variables");
}

if (!redirectUri) {
    throw new Error("GOOGLE_CALLBACK_URL is missing from environment variables");
}

export const googleClient = new OAuth2Client(
    clientId,
    clientSecret,
    redirectUri
);