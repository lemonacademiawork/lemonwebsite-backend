import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let instance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables."
    );
  }

  if (!instance) {
    instance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return instance;
};

// Export proxy for backwards-compatible `razorpayInstance` usage without crashing on module load
export const razorpayInstance = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const client = getRazorpayInstance();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default razorpayInstance;
