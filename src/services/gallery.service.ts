import { prisma } from "../config/database";
import { GalleryStatus } from "@prisma/client";

interface CreateGalleryData {
  courseId: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType?: string;
}

interface GetGalleryOptions {
  courseId?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

interface ModerateGalleryData {
  status?: GalleryStatus;
  isFeatured?: boolean;
  adminFeedback?: string;
}

interface GetAdminGalleryOptions {
  status?: GalleryStatus;
  courseId?: string;
  page?: number;
  limit?: number;
}

const safeStudentSelect = {
  id: true,
  name: true,
  email: true,
  studentProfile: {
    select: {
      name: true,
      avatarUrl: true,
    },
  },
};

export const createGallerySubmission = async (
  studentId: string,
  data: CreateGalleryData
) => {
  const { courseId, title, description, mediaUrl, mediaType = "IMAGE" } = data;

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }

  if (!mediaUrl || mediaUrl.trim() === "") {
    throw new Error("Media URL is required");
  }

  // 1. Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // 2. Verify student enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
    },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course to submit artwork to the gallery");
  }

  // 3. Create submission
  const submission = await prisma.gallerySubmission.create({
    data: {
      studentId,
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      mediaUrl: mediaUrl.trim(),
      mediaType: mediaType.toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE",
      status: GalleryStatus.PENDING,
      isFeatured: false,
    },
    include: {
      student: {
        select: safeStudentSelect,
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return submission;
};

export const getApprovedGallery = async (options: GetGalleryOptions = {}) => {
  const { courseId, isFeatured, page = 1, limit = 12 } = options;
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const take = Math.min(Math.max(1, limit), 50);

  const whereClause: any = {
    status: GalleryStatus.APPROVED,
  };

  if (courseId) {
    whereClause.courseId = courseId;
  }

  if (isFeatured !== undefined) {
    whereClause.isFeatured = isFeatured;
  }

  const [submissions, totalCount] = await Promise.all([
    prisma.gallerySubmission.findMany({
      where: whereClause,
      include: {
        student: {
          select: safeStudentSelect,
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.gallerySubmission.count({
      where: whereClause,
    }),
  ]);

  return {
    submissions,
    pagination: {
      total: totalCount,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(totalCount / take) || 1,
    },
  };
};

export const getMyGallerySubmissions = async (studentId: string) => {
  const submissions = await prisma.gallerySubmission.findMany({
    where: {
      studentId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return submissions;
};

export const getGallerySubmissionById = async (id: string) => {
  const submission = await prisma.gallerySubmission.findUnique({
    where: { id },
    include: {
      student: {
        select: safeStudentSelect,
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      moderator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Gallery submission not found");
  }

  return submission;
};

export const deleteGallerySubmission = async (
  id: string,
  userId: string,
  userRole: string
) => {
  const existing = await prisma.gallerySubmission.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Gallery submission not found");
  }

  if (existing.studentId !== userId && userRole !== "ADMIN") {
    throw new Error("Forbidden: You can only delete your own gallery submissions");
  }

  await prisma.gallerySubmission.delete({
    where: { id },
  });

  return { id, message: "Gallery submission deleted successfully" };
};

export const moderateGallerySubmission = async (
  id: string,
  adminId: string,
  data: ModerateGalleryData
) => {
  const existing = await prisma.gallerySubmission.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, name: true, phone: true, email: true },
      },
      course: {
        select: { id: true, title: true, trainerId: true },
      },
    },
  });

  if (!existing) {
    throw new Error("Gallery submission not found");
  }

  const updated = await prisma.gallerySubmission.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.adminFeedback !== undefined && {
        adminFeedback: data.adminFeedback.trim() || null,
      }),
      moderatedBy: adminId,
      moderatedAt: new Date(),
    },
    include: {
      student: {
        select: safeStudentSelect,
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          trainerId: true,
        },
      },
    },
  });

  // When artwork is REJECTED, notify both Student and Trainer
  if (data.status === "REJECTED") {
    const feedbackText = data.adminFeedback?.trim()
      ? ` Feedback: "${data.adminFeedback.trim()}"`
      : "";

    const notificationsToCreate: Array<{
      userId: string;
      title: string;
      message: string;
      type: string;
    }> = [
      {
        userId: existing.studentId,
        title: "Artwork Submission Rejected",
        message: `Your artwork "${existing.title}" for course "${existing.course?.title || "Course"}" was not approved by admin.${feedbackText}`,
        type: "GALLERY_REJECTED",
      },
    ];

    // If the course has an assigned trainer, notify the trainer too
    if (existing.course?.trainerId && existing.course.trainerId !== existing.studentId) {
      const studentName = existing.student?.name || "A student";
      notificationsToCreate.push({
        userId: existing.course.trainerId,
        title: "Student Artwork Rejected",
        message: `Artwork "${existing.title}" submitted by ${studentName} for course "${existing.course?.title || "Course"}" was rejected by admin.${feedbackText}`,
        type: "GALLERY_REJECTED",
      });
    }

    await prisma.notification.createMany({
      data: notificationsToCreate,
    });
  }

  return updated;
};

export const getAllGallerySubmissionsAdmin = async (
  options: GetAdminGalleryOptions = {}
) => {
  const { status, courseId, page = 1, limit = 20 } = options;
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const take = Math.min(Math.max(1, limit), 100);

  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }

  if (courseId) {
    whereClause.courseId = courseId;
  }

  const [submissions, totalCount] = await Promise.all([
    prisma.gallerySubmission.findMany({
      where: whereClause,
      include: {
        student: {
          select: safeStudentSelect,
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.gallerySubmission.count({
      where: whereClause,
    }),
  ]);

  return {
    submissions,
    pagination: {
      total: totalCount,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(totalCount / take) || 1,
    },
  };
};
