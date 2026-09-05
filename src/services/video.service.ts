import { uploadStreamToCloudinary, deleteFromCloudinary, cloudinary } from "../config/cloudinary";

export interface VideoUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  duration: number;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  thumbnailUrl?: string;
}

/**
 * Upload a video buffer to Cloudinary in the lessons or course folder
 */
export const uploadLessonVideo = async (
  buffer: Buffer,
  folder: string = "lemon_academia/lessons"
): Promise<VideoUploadResult> => {
  const result = await uploadStreamToCloudinary(buffer, {
    folder,
    resource_type: "video",
  });

  // Generate an auto thumbnail URL from the video
  const thumbnailUrl = cloudinary.url(result.public_id, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { width: 640, crop: "scale" },
      { start_offset: "1" },
    ],
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    duration: Math.round(result.duration || 0),
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    thumbnailUrl,
  };
};

/**
 * Delete a video from Cloudinary
 */
export const deleteLessonVideo = async (publicId: string) => {
  return deleteFromCloudinary(publicId, "video");
};
