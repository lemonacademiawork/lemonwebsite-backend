import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { checkCourseAccess } from "../services/enrollment.service";

/**
 * Middleware to ensure the authenticated user has active access/enrollment to the requested course.
 *
 * Flow:
 * 1. Checks req.user (returns 401 if missing)
 * 2. Extracts courseId from req.params (id or courseId)
 * 3. Verifies course existence in the database (returns 404 if not found)
 * 4. Allows ADMIN or the course trainer
 * 5. Calls checkCourseAccess(studentId, courseId) to verify ACTIVE enrollment
 * 6. Returns 403 if the student is not enrolled
 * 7. Calls next() if access is permitted
 */
export const requireEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1. Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Extract courseId from params
    const courseId = req.params.courseId || req.params.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // 3. Verify course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 4. ADMIN or course trainer has inherent access
    if (req.user.role === "ADMIN" || course.trainerId === req.user.userId) {
      return next();
    }

    // 5. Verify student has an ACTIVE enrollment
    try {
      await checkCourseAccess(req.user.userId, courseId);
    } catch {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    return next();
  } catch (error) {
    console.error("requireEnrollment middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify course access",
    });
  }
};

export default requireEnrollment;
