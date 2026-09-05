import { prisma } from "../config/database";

export const getMyCertificates = async (studentId: string) => {
  const certificates = await prisma.certificate.findMany({
    where: {
      studentId,
    },
    include: {
      course: true,
    },
    orderBy: {
      issueDate: "desc",
    },
  });

  return certificates;
};

export const getCertificateByCourse = async (
  studentId: string,
  courseId: string
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const certificate = await prisma.certificate.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    include: {
      course: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  return certificate;
};

export const createCertificate = async (
  studentId: string,
  courseId: string
) => {
  // Check course exists
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Check if student already has a certificate for this course
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (existingCertificate) {
    throw new Error("Certificate already exists");
  }

  // Generate unique certificateNumber and verificationCode
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();

  const certificateNumber = `CERT-${timestamp}-${randomSuffix}`;
  const verificationCode = `VERIFY-${timestamp}-${randomHex}`;

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      studentId,
      courseId,
      certificateNumber,
      verificationCode,
    },
    include: {
      course: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return certificate;
};
export const verifyCertificate = async (
  verificationCode: string
) => {
  const certificate = await prisma.certificate.findUnique({
    where: {
      verificationCode,
    },
    include: {
      course: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  return certificate;
};