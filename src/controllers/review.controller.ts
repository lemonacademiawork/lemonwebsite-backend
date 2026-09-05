import { Request, Response } from "express";
import {
  createReview,
  getCourseReviews,
  getMyCourseReview,
  getReviewById,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  toggleReviewPublish,
} from "../services/review.service";

export const createReviewController = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courseId = req.params.courseId || req.body.courseId;
    const { rating, comment } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Rating is required (must be an integer between 1 and 5)",
      });
    }

    const review = await createReview(studentId, {
      courseId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review";

    if (message === "Course not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message.includes("enrolled") ||
      message.includes("You must be enrolled")
    ) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    if (
      message.includes("already reviewed") ||
      message.includes("between 1 and 5") ||
      message.includes("Rating is required")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

export const getCourseReviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.courseId || (req.query.courseId as string);

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const rating = req.query.rating
      ? parseInt(req.query.rating as string, 10)
      : undefined;

    const result = await getCourseReviews(courseId, {
      page,
      limit,
      rating,
    });

    return res.status(200).json({
      success: true,
      message: "Course reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch course reviews";

    if (message === "Course not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    console.error("Get course reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course reviews",
    });
  }
};

export const getMyCourseReviewController = async (
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

    const courseId = req.params.courseId || (req.query.courseId as string);
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const review = await getMyCourseReview(studentId, courseId);

    return res.status(200).json({
      success: true,
      message: review
        ? "Your review fetched successfully"
        : "No review found for this course",
      data: review,
    });
  } catch (error) {
    console.error("Get my course review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your review",
    });
  }
};

export const getReviewByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
    }

    const review = await getReviewById(id);

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch review";

    if (message === "Review not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    console.error("Get review by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
    });
  }
};

export const updateReviewController = async (req: Request, res: Response) => {
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
        message: "Review ID is required",
      });
    }

    const { rating, comment } = req.body;
    const updatedReview = await updateReview(id, userId, userRole, {
      rating,
      comment,
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update review";

    if (message === "Review not found") {
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

    if (
      message.includes("between 1 and 5") ||
      message.includes("Rating must be")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

export const deleteReviewController = async (req: Request, res: Response) => {
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
        message: "Review ID is required",
      });
    }

    const result = await deleteReview(id, userId, userRole);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete review";

    if (message === "Review not found") {
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

    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

export const getAllReviewsAdminController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const courseId = req.query.courseId as string | undefined;
    const rating = req.query.rating
      ? parseInt(req.query.rating as string, 10)
      : undefined;
    const search = req.query.search as string | undefined;

    let isPublished: boolean | undefined = undefined;
    if (req.query.isPublished !== undefined) {
      isPublished = req.query.isPublished === "true";
    }

    const result = await getAllReviewsAdmin({
      page,
      limit,
      courseId,
      rating,
      isPublished,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

export const toggleReviewPublishController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
    }

    const { isPublished } = req.body;
    const updatedReview = await toggleReviewPublish(id, isPublished);

    return res.status(200).json({
      success: true,
      message: `Review ${updatedReview.isPublished ? "published" : "unpublished"} successfully`,
      data: updatedReview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle review publish";

    if (message === "Review not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    console.error("Toggle review publish error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review publish status",
    });
  }
};
