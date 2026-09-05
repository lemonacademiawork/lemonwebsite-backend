import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

let instance: OAuth2Client | null = null;

export const getGoogleClient = (): OAuth2Client => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth credentials missing. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL in environment variables."
    );
  }

  if (!instance) {
    instance = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  return instance;
};

// Export proxy for backwards-compatible `googleClient` usage without crashing on module load
export const googleClient = new Proxy({} as OAuth2Client, {
  get(_target, prop) {
    const client = getGoogleClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default googleClient;