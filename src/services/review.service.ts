import { prisma } from "../config/database";

interface CreateReviewData {
  courseId: string;
  rating: number;
  comment?: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

interface GetCourseReviewsOptions {
  page?: number;
  limit?: number;
  rating?: number;
}

interface GetAllReviewsOptions {
  page?: number;
  limit?: number;
  courseId?: string;
  rating?: number;
  isPublished?: boolean;
  search?: string;
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

export const createReview = async (
  studentId: string,
  data: CreateReviewData
) => {
  const { courseId, rating, comment } = data;

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  if (rating === undefined || rating === null) {
    throw new Error("Rating is required");
  }

  const numericRating = Number(rating);
  if (
    isNaN(numericRating) ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  // 1. Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // 2. Check if student is actively enrolled in the course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
    },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course to leave a review");
  }

  // 3. Check if user already reviewed this course
  const existingReview = await prisma.review.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this course");
  }

  // 4. Create review
  const review = await prisma.review.create({
    data: {
      studentId,
      courseId,
      rating: numericRating,
      comment: comment?.trim() || null,
      isPublished: true,
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

  return review;
};

export const getCourseReviews = async (
  courseId: string,
  options: GetCourseReviewsOptions = {}
) => {
  const { page = 1, limit = 10, rating } = options;
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const take = Math.min(Math.max(1, limit), 50);

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, slug: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const whereClause: any = {
    courseId,
    isPublished: true,
  };

  if (rating) {
    whereClause.rating = Number(rating);
  }

  const [reviews, totalCount, aggregateData, breakdownRaw] = await Promise.all([
    prisma.review.findMany({
      where: whereClause,
      include: {
        student: {
          select: safeStudentSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.review.count({
      where: whereClause,
    }),
    prisma.review.aggregate({
      where: {
        courseId,
        isPublished: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: {
        courseId,
        isPublished: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdownRaw.forEach((item) => {
    breakdown[item.rating] = item._count.id;
  });

  const averageRating = aggregateData._avg.rating
    ? Number(aggregateData._avg.rating.toFixed(2))
    : 0;

  return {
    course,
    stats: {
      totalReviews: aggregateData._count.id,
      averageRating,
      breakdown,
    },
    reviews,
    pagination: {
      total: totalCount,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(totalCount / take) || 1,
    },
  };
};

export const getMyCourseReview = async (
  studentId: string,
  courseId: string
) => {
  const review = await prisma.review.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
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

  return review;
};

export const getReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
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

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const updateReview = async (
  reviewId: string,
  userId: string,
  userRole: string,
  data: UpdateReviewData
) => {
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existing) {
    throw new Error("Review not found");
  }

  if (existing.studentId !== userId && userRole !== "ADMIN") {
    throw new Error("Forbidden: You can only update your own review");
  }

  let ratingToUpdate: number | undefined = undefined;
  if (data.rating !== undefined) {
    const numericRating = Number(data.rating);
    if (
      isNaN(numericRating) ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw new Error("Rating must be an integer between 1 and 5");
    }
    ratingToUpdate = numericRating;
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(ratingToUpdate !== undefined && { rating: ratingToUpdate }),
      ...(data.comment !== undefined && { comment: data.comment.trim() || null }),
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

  return updated;
};

export const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existing) {
    throw new Error("Review not found");
  }

  if (existing.studentId !== userId && userRole !== "ADMIN") {
    throw new Error("Forbidden: You can only delete your own review");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { id: reviewId, message: "Review deleted successfully" };
};

export const getAllReviewsAdmin = async (
  options: GetAllReviewsOptions = {}
) => {
  const {
    page = 1,
    limit = 20,
    courseId,
    rating,
    isPublished,
    search,
  } = options;
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const take = Math.min(Math.max(1, limit), 100);

  const whereClause: any = {};

  if (courseId) {
    whereClause.courseId = courseId;
  }

  if (rating !== undefined) {
    whereClause.rating = Number(rating);
  }

  if (isPublished !== undefined) {
    whereClause.isPublished = isPublished;
  }

  if (search) {
    whereClause.OR = [
      { comment: { contains: search, mode: "insensitive" } },
      { student: { name: { contains: search, mode: "insensitive" } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
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
    prisma.review.count({
      where: whereClause,
    }),
  ]);

  return {
    reviews,
    pagination: {
      total: totalCount,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(totalCount / take) || 1,
    },
  };
};

export const toggleReviewPublish = async (
  reviewId: string,
  isPublished?: boolean
) => {
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existing) {
    throw new Error("Review not found");
  }

  const newStatus =
    isPublished !== undefined ? isPublished : !existing.isPublished;

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isPublished: newStatus,
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

  return updated;
};
