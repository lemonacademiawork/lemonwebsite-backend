import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const requireRoles = (...allowedRoles: (UserRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return next();
  };
};

export default requireRoles;

