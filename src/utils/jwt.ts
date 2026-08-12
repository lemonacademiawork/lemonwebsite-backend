import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is missing from environment variables");
  }

  return jwt.sign({ userId, role }, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is missing from environment variables");
  }

  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ userId }, secret, {
    expiresIn,
  });
};

