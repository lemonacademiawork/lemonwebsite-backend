import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface JwtPayloadWithUser extends jwt.JwtPayload {
  userId: string;
  role: UserRole;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is missing from environment variables");
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header format",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayloadWithUser;

    if (!decoded || typeof decoded.userId !== "string" || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authenticate;

