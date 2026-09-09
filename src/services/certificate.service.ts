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

  // 1. Check if certificate already exists
  const existingCertificate = await prisma.certificate.findUnique({
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

  if (existingCertificate) {
    return existingCertificate;
  }

  // 2. If certificate doesn't exist yet, check if student is eligible (100% completion)
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: "ACTIVE",
    },
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  // Calculate total published lessons
  const totalLessons = await prisma.lesson.count({
    where: {
      module: {
        courseId,
        isPublished: true,
      },
      isPublished: true,
    },
  });

  if (totalLessons === 0) {
    throw new Error("This course does not have any published lessons yet");
  }

  // Calculate completed lessons
  const completedLessons = await prisma.progress.count({
    where: {
      studentId,
      courseId,
      isCompleted: true,
      lesson: {
        isPublished: true,
        module: {
          courseId,
          isPublished: true,
        },
      },
    },
  });

  if (completedLessons < totalLessons) {
    const percentage = Math.round((completedLessons / totalLessons) * 100);
    throw new Error(
      `Course incomplete: You must complete all lessons (${completedLessons}/${totalLessons} completed, ${percentage}%) before accessing your certificate.`
    );
  }

  // 3. Check course scheduled end date (e.g. 7-day course ending on Sept 11)
  if (course.endDate && Date.now() < new Date(course.endDate).getTime()) {
    const formattedDate = new Date(course.endDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    throw new Error(
      `Course schedule active: Certificate will be unlocked on or after ${formattedDate} once the course timeline ends.`
    );
  }

  // 4. Auto-generate certificate if 100% complete and course date has ended
  return await createCertificate(studentId, courseId);
};

export const createCertificate = async (
  studentId: string,
  courseId: string
) => {
  // 1. Check course exists
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // 2. Check active enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: "ACTIVE",
    },
  });

  if (!enrollment) {
    throw new Error("You must be actively enrolled in this course to earn a certificate");
  }

  // 3. Check if student already has a certificate for this course
  const existingCertificate = await prisma.certificate.findUnique({
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

  if (existingCertificate) {
    return existingCertificate;
  }

  // 4. Check total published lessons vs completed lessons (must be 100%)
  const totalLessons = await prisma.lesson.count({
    where: {
      module: {
        courseId,
        isPublished: true,
      },
      isPublished: true,
    },
  });

  if (totalLessons === 0) {
    throw new Error("This course does not have any published lessons yet");
  }

  const completedLessons = await prisma.progress.count({
    where: {
      studentId,
      courseId,
      isCompleted: true,
      lesson: {
        isPublished: true,
        module: {
          courseId,
          isPublished: true,
        },
      },
    },
  });

  if (completedLessons < totalLessons) {
    const percentage = Math.round((completedLessons / totalLessons) * 100);
    throw new Error(
      `Course incomplete: You must complete all lessons (${completedLessons}/${totalLessons} completed, ${percentage}%) to earn your certificate.`
    );
  }

  // 5. Check course scheduled end date (e.g. 7-day course ending on Sept 11)
  if (course.endDate && Date.now() < new Date(course.endDate).getTime()) {
    const formattedDate = new Date(course.endDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    throw new Error(
      `Course schedule active: Certificate will be unlocked on or after ${formattedDate} once the course timeline ends.`
    );
  }

  // 6. Generate unique certificateNumber and verificationCode
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();

  const certificateNumber = `CERT-${timestamp}-${randomSuffix}`;
  const verificationCode = `VERIFY-${timestamp}-${randomHex}`;

  // 6. Create certificate
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