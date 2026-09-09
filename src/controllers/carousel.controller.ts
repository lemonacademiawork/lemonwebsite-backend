import { Request, Response } from "express";
import {
  getPublicCarouselSlides,
  getAdminCarouselSlides,
  getCarouselSlideById,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
} from "../services/carousel.service";

/**
 * Public: Get active carousel slides
 */
export const getPublicCarouselSlidesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const slides = await getPublicCarouselSlides();
    return res.status(200).json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("Get public carousel slides error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch carousel slides",
    });
  }
};

/**
 * Admin: Get all carousel slides (active and inactive)
 */
export const getAdminCarouselSlidesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const slides = await getAdminCarouselSlides();
    return res.status(200).json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("Get admin carousel slides error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch carousel slides",
    });
  }
};

/**
 * Admin: Get single carousel slide
 */
export const getCarouselSlideByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const slide = await getCarouselSlideById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Carousel slide not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error("Get carousel slide by id error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch carousel slide",
    });
  }
};

/**
 * Admin: Create new carousel slide
 */
export const createCarouselSlideController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      tagline,
      description,
      imageUrl,
      route,
      category,
      order,
      isActive,
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "title and imageUrl are required",
      });
    }

    const slide = await createCarouselSlide({
      title,
      tagline,
      description,
      imageUrl,
      route,
      category,
      order: order !== undefined ? Number(order) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Carousel slide created successfully",
      data: slide,
    });
  } catch (error) {
    console.error("Create carousel slide error:", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create carousel slide",
    });
  }
};

/**
 * Admin: Update carousel slide
 */
export const updateCarouselSlideController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      title,
      tagline,
      description,
      imageUrl,
      route,
      category,
      order,
      isActive,
    } = req.body;

    const slide = await updateCarouselSlide(id, {
      title,
      tagline,
      description,
      imageUrl,
      route,
      category,
      order: order !== undefined ? Number(order) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Carousel slide updated successfully",
      data: slide,
    });
  } catch (error) {
    console.error("Update carousel slide error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update carousel slide";
    const statusCode = message === "Carousel slide not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * Admin: Delete carousel slide
 */
export const deleteCarouselSlideController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    await deleteCarouselSlide(id);

    return res.status(200).json({
      success: true,
      message: "Slide deleted successfully",
    });
  } catch (error) {
    console.error("Delete carousel slide error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete carousel slide";
    const statusCode = message === "Carousel slide not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

/**
 * Admin: Bulk reorder carousel slides
 */
export const reorderCarouselSlidesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { slides } = req.body;

    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({
        success: false,
        message: "slides array is required with { id, order } items",
      });
    }

    const updatedSlides = await reorderCarouselSlides(slides);

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedSlides,
    });
  } catch (error) {
    console.error("Reorder carousel slides error:", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reorder carousel slides",
    });
  }
};
