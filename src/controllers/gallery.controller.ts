import { Request, Response } from "express";
import {
  createGallerySubmission,
  getApprovedGallery,
  getMyGallerySubmissions,
  getGallerySubmissionById,
  deleteGallerySubmission,
  moderateGallerySubmission,
  getAllGallerySubmissionsAdmin,
} from "../services/gallery.service";

export const createGallerySubmissionController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courseId = req.params.courseId || req.body.courseId;
    const { title, description, mediaUrl, mediaType } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Media URL is required",
      });
    }

    const submission = await createGallerySubmission(studentId, {
      courseId,
      title,
      description,
      mediaUrl,
      mediaType,
    });

    return res.status(201).json({
      success: true,
      message: "Gallery submission created successfully",
      data: submission,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create gallery submission";

    if (message === "Course not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message.includes("enrolled")) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    if (
      message.includes("is required") ||
      message.includes("Title is required") ||
      message.includes("Media URL is required")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Create gallery submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create gallery submission",
    });
  }
};

export const getApprovedGalleryController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.courseId || (req.query.courseId as string);
    const isFeatured =
      req.query.isFeatured !== undefined
        ? req.query.isFeatured === "true"
        : undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 12;

    const result = await getApprovedGallery({
      courseId,
      isFeatured,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Gallery submissions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get gallery submissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery submissions",
    });
  }
};

export const getMyGallerySubmissionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const submissions = await getMyGallerySubmissions(studentId);

    return res.status(200).json({
      success: true,
      message: "My gallery submissions fetched successfully",
      data: submissions,
    });
  } catch (error) {
    console.error("Get my gallery submissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your gallery submissions",
    });
  }
};

export const getGallerySubmissionByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    const submission = await getGallerySubmissionById(id);

    return res.status(200).json({
      success: true,
      message: "Gallery submission fetched successfully",
      data: submission,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch gallery submission";

    if (message === "Gallery submission not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    console.error("Get gallery submission by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery submission",
    });
  }
};

export const deleteGallerySubmissionController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role || "";

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    const result = await deleteGallerySubmission(id, userId, userRole);

    return res.status(200).json({
      success: true,
      message: "Gallery submission deleted successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete gallery submission";

    if (message === "Gallery submission not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message.startsWith("Forbidden")) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    console.error("Delete gallery submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete gallery submission",
    });
  }
};

export const moderateGallerySubmissionController = async (
  req: Request,
  res: Response
) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    const { status, isFeatured, adminFeedback } = req.body;
    const updated = await moderateGallerySubmission(id, adminId, {
      status,
      isFeatured,
      adminFeedback,
    });

    return res.status(200).json({
      success: true,
      message: "Gallery submission moderated successfully",
      data: updated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to moderate gallery submission";

    if (message === "Gallery submission not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    console.error("Moderate gallery submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to moderate gallery submission",
    });
  }
};

export const getAllGallerySubmissionsAdminController = async (
  req: Request,
  res: Response
) => {
  try {
    const status = req.query.status as any;
    const courseId = req.query.courseId as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;

    const result = await getAllGallerySubmissionsAdmin({
      status,
      courseId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Admin gallery submissions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get admin gallery submissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery submissions",
    });
  }
};
