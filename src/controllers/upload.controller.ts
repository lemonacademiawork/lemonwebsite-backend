import { Request, Response } from "express";
import {
  uploadStreamToCloudinary,
  deleteFromCloudinary,
  generateUploadSignature,
  cloudinary,
} from "../config/cloudinary";

/**
 * Helper to get clean folder path with default
 */
const getUploadFolder = (req: Request, defaultFolder: string): string => {
  const folder = (req.body.folder || req.query.folder || defaultFolder) as string;
  return folder.startsWith("lemon_academia") ? folder : `lemon_academia/${folder}`;
};

/**
 * Upload a single image
 */
export const uploadImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const folder = getUploadFolder(req, "images");
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder,
      resource_type: "image",
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload image",
    });
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImagesController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const folder = getUploadFolder(req, "gallery");
    const uploadPromises = files.map((file) =>
      uploadStreamToCloudinary(file.buffer, {
        folder,
        resource_type: "image",
      })
    );

    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      })),
    });
  } catch (error) {
    console.error("Upload multiple images error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload images",
    });
  }
};

/**
 * Upload a single video
 */
export const uploadVideoController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const folder = getUploadFolder(req, "videos");
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder,
      resource_type: "video",
    });

    const thumbnailUrl = cloudinary.url(result.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        { width: 640, crop: "scale" },
        { start_offset: "1" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: Math.round(result.duration || 0),
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Upload video error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload video",
    });
  }
};

/**
 * Upload a document or PDF or raw file
 */
export const uploadDocumentController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    const folder = getUploadFolder(req, "documents");
    const isPdf = req.file.mimetype === "application/pdf";
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder,
      resource_type: isPdf ? "auto" : "raw",
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format || req.file.originalname.split(".").pop(),
        bytes: result.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload document",
    });
  }
};

/**
 * Upload User/Trainer Avatar with square crop
 */
export const uploadAvatarController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No avatar image provided",
      });
    }

    const folder = getUploadFolder(req, "avatars");
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload avatar",
    });
  }
};

/**
 * Upload any supported media (image, video, document)
 */
export const uploadMediaController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No media file provided",
      });
    }

    const folder = getUploadFolder(req, "media");
    const result = await uploadStreamToCloudinary(req.file.buffer, {
      folder,
      resource_type: "auto",
    });

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        duration: result.duration ? Math.round(result.duration) : undefined,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload media",
    });
  }
};

/**
 * Delete an uploaded resource from Cloudinary
 */
export const deleteUploadController = async (req: Request, res: Response) => {
  try {
    const publicId = req.body.publicId || (req.query.publicId as string);
    const resourceType = (req.body.resourceType || req.query.resourceType || "image") as
      | "image"
      | "video"
      | "raw";

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }

    const result = await deleteFromCloudinary(publicId, resourceType);

    return res.status(200).json({
      success: true,
      message: "Resource deleted from Cloudinary",
      data: result,
    });
  } catch (error) {
    console.error("Delete upload error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete resource",
    });
  }
};

/**
 * Get signed upload params for direct client upload
 */
export const getUploadSignatureController = async (req: Request, res: Response) => {
  try {
    const folder = getUploadFolder(req, "direct");
    const signedParams = generateUploadSignature(folder);

    return res.status(200).json({
      success: true,
      message: "Upload signature generated successfully",
      data: signedParams,
    });
  } catch (error) {
    console.error("Get upload signature error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate signature",
    });
  }
};
