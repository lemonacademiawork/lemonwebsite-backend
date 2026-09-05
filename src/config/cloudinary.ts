import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: "auto" | "image" | "video" | "raw";
  public_id?: string;
  overwrite?: boolean;
  transformation?: any[];
  format?: string;
}

/**
 * Upload a memory Buffer to Cloudinary via stream
 */
export const uploadStreamToCloudinary = (
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || "lemon_academia",
      resource_type: options.resource_type || "auto",
      ...(options.public_id && { public_id: options.public_id }),
      ...(options.overwrite !== undefined && { overwrite: options.overwrite }),
      ...(options.transformation && { transformation: options.transformation }),
      ...(options.format && { format: options.format }),
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload failed with empty result"));
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Upload a local file path to Cloudinary
 */
export const uploadFileToCloudinary = (
  filePath: string,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> => {
  const uploadOptions: UploadApiOptions = {
    folder: options.folder || "lemon_academia",
    resource_type: options.resource_type || "auto",
    ...(options.public_id && { public_id: options.public_id }),
    ...(options.overwrite !== undefined && { overwrite: options.overwrite }),
    ...(options.transformation && { transformation: options.transformation }),
    ...(options.format && { format: options.format }),
  };

  return cloudinary.uploader.upload(filePath, uploadOptions);
};

/**
 * Delete a resource from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

/**
 * Generate signed upload parameters for client-side direct uploads
 */
export const generateUploadSignature = (
  folder: string = "lemon_academia",
  customParams: Record<string, any> = {}
) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign: Record<string, any> = {
    folder,
    timestamp,
    ...customParams,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  };
};

export { cloudinary };
export default cloudinary;
