import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Storage: keep file in memory as Buffer for direct Cloudinary stream upload
const memoryStorage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
];

// File Filter Factories
const createImageFilter = () => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image format. Allowed: JPG, JPEG, PNG, WEBP, SVG, GIF"));
    }
  };
};

const createVideoFilter = () => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video format. Allowed: MP4, WEBM, MOV, MKV, AVI"));
    }
  };
};

const createDocumentFilter = () => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype) || ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid document format. Allowed: PDF, DOC, DOCX, XLS, XLSX, ZIP, TXT, CSV, Images"));
    }
  };
};

const createMediaFilter = () => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
      ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
      ALLOWED_VIDEO_TYPES.includes(file.mimetype) ||
      ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type uploaded"));
    }
  };
};

// Size Limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_MEDIA_SIZE = 500 * 1024 * 1024; // 500 MB

// Upload Middleware Instances
export const uploadSingleImage = (fieldName: string = "image") =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: createImageFilter(),
  }).single(fieldName);

export const uploadMultipleImages = (fieldName: string = "images", maxCount: number = 10) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: createImageFilter(),
  }).array(fieldName, maxCount);

export const uploadSingleVideo = (fieldName: string = "video") =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_VIDEO_SIZE },
    fileFilter: createVideoFilter(),
  }).single(fieldName);

export const uploadSingleDocument = (fieldName: string = "file") =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_DOCUMENT_SIZE },
    fileFilter: createDocumentFilter(),
  }).single(fieldName);

export const uploadSingleMedia = (fieldName: string = "file") =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_MEDIA_SIZE },
    fileFilter: createMediaFilter(),
  }).single(fieldName);

export const uploadMultipleMedia = (fieldName: string = "files", maxCount: number = 10) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_MEDIA_SIZE },
    fileFilter: createMediaFilter(),
  }).array(fieldName, maxCount);
