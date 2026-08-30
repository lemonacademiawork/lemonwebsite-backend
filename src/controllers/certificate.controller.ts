import { Request, Response } from "express";
import {
  createCertificate,
  getMyCertificates,
} from "../services/certificate.service";

export const createCertificateController = async (
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

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const certificate = await createCertificate(studentId, courseId);

    return res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      data: certificate,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create certificate";

    if (message === "Course not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message === "Certificate already exists") {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Create certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create certificate",
    });
  }
};

export const getMyCertificatesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const certificates = await getMyCertificates(userId);

    return res.status(200).json({
      success: true,
      message: "Certificates fetched successfully",
      data: certificates,
    });
  } catch (error) {
    console.error("Get my certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};
