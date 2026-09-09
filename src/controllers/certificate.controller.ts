import { Request, Response } from "express";
import {
  createCertificate,
  getMyCertificates,
  getCertificateByCourse,
  verifyCertificate,
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

    if (
      message.startsWith("Course incomplete:") ||
      message.startsWith("Course schedule active:") ||
      message.includes("You must be actively enrolled") ||
      message.includes("This course does not have any published lessons") ||
      message === "Certificate already exists"
    ) {
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

export const getCertificateByCourseController = async (
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

    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const certificate = await getCertificateByCourse(studentId, courseId);

    return res.status(200).json({
      success: true,
      message: "Certificate fetched successfully",
      data: certificate,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch certificate";

    if (message === "Course not found") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      message.startsWith("Course incomplete:") ||
      message.startsWith("Course schedule active:") ||
      message.includes("You are not enrolled")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (message === "Certificate not found") {
      return res.status(404).json({
        success: false,
        message: "Certificate not found for this course",
      });
    }

    console.error("Get certificate by course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};
export const verifyCertificateController = async (
  req: Request,
  res: Response
) => {
  try {
    const { verificationCode } = req.params;

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const certificate = await verifyCertificate(
      verificationCode
    );

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: certificate,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to verify certificate";

    if (message === "Certificate not found") {
      return res.status(404).json({
        success: false,
        message: "Invalid certificate",
      });
    }

    console.error("Verify certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate",
    });
  }
};