import { prisma } from "../config/database";

export interface CreateCarouselSlideInput {
  title: string;
  tagline?: string;
  description?: string;
  imageUrl: string;
  route?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCarouselSlideInput {
  title?: string;
  tagline?: string;
  description?: string;
  imageUrl?: string;
  route?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderSlideItem {
  id: string;
  order: number;
}

export const DEFAULT_CAROUSEL_SLIDES = [
  {
    title: "Learn. Create. Inspire.",
    tagline: "Master the art of Lippan Mirror Work",
    description: "Explore mirror & clay magic in our modern studio classes.",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
    route: "/courses",
    category: "lippan-art",
    order: 1,
    isActive: true,
  },
  {
    title: "Crafted with Warmth & Aroma",
    tagline: "Artisan Soy Candle Making Masterclass",
    description: "Hand-pour scented botanical candles with pure essential oils.",
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200&q=80",
    route: "/courses",
    category: "candle-making",
    order: 2,
    isActive: true,
  },
  {
    title: "Fluid Dreams in Crystal Clear Resin",
    tagline: "Master Ocean Resin Art & Geodes",
    description: "Form realistic ocean waves, crystal geodes, and glossy coasters.",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80",
    route: "/courses",
    category: "resin-art",
    order: 3,
    isActive: true,
  },
  {
    title: "Assemble Colors Piece by Piece",
    tagline: "Mosaic Art & Tile Crafting",
    description: "Transform glass and ceramic pieces into stunning decorative art.",
    imageUrl: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=1200&q=80",
    route: "/courses",
    category: "mosaic-art",
    order: 4,
    isActive: true,
  },
  {
    title: "Shape Earth into Timeless Art",
    tagline: "Hand-building Clay & Studio Pottery",
    description: "Sculpt organic planters, mugs, and vases with hand-building clay techniques.",
    imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
    route: "/courses",
    category: "pottery",
    order: 5,
    isActive: true,
  },
  {
    title: "Knit. Weave. Express.",
    tagline: "Artisan Crochet & Fiber Crafts",
    description: "Master intricate stitch patterns with step-by-step video guidance.",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1200&q=80",
    route: "/courses",
    category: "crochet-basics",
    order: 6,
    isActive: true,
  },
];

/**
 * Seed initial 6 signature crafts if database has no slides
 */
export const seedDefaultCarouselSlides = async () => {
  const count = await prisma.carouselSlide.count();
  if (count === 0) {
    console.log("🌱 Auto-seeding 6 default carousel hero slides...");
    await prisma.carouselSlide.createMany({
      data: DEFAULT_CAROUSEL_SLIDES,
    });
    console.log("✅ Default carousel slides seeded successfully.");
  }
};

/**
 * Get active slides for public homepage hero carousel
 */
export const getPublicCarouselSlides = async () => {
  // Ensure default slides are present if empty
  const count = await prisma.carouselSlide.count();
  if (count === 0) {
    await seedDefaultCarouselSlides();
  }

  return await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });
};

/**
 * Get all slides (active & inactive) for Admin
 */
export const getAdminCarouselSlides = async () => {
  const count = await prisma.carouselSlide.count();
  if (count === 0) {
    await seedDefaultCarouselSlides();
  }

  return await prisma.carouselSlide.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });
};

/**
 * Get single carousel slide by ID
 */
export const getCarouselSlideById = async (id: string) => {
  return await prisma.carouselSlide.findUnique({
    where: { id },
  });
};

/**
 * Create a new carousel slide
 */
export const createCarouselSlide = async (data: CreateCarouselSlideInput) => {
  if (!data.title || !data.title.trim()) {
    throw new Error("Slide title is required");
  }

  if (!data.imageUrl || !data.imageUrl.trim()) {
    throw new Error("Slide imageUrl is required");
  }

  let finalOrder = data.order;
  if (finalOrder === undefined || finalOrder === null) {
    const highestOrder = await prisma.carouselSlide.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    finalOrder = (highestOrder?.order ?? 0) + 1;
  }

  return await prisma.carouselSlide.create({
    data: {
      title: data.title.trim(),
      tagline: data.tagline?.trim() || null,
      description: data.description?.trim() || null,
      imageUrl: data.imageUrl.trim(),
      route: data.route?.trim() || "/courses",
      category: data.category?.trim() || null,
      order: finalOrder,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

/**
 * Update carousel slide by ID
 */
export const updateCarouselSlide = async (
  id: string,
  data: UpdateCarouselSlideInput
) => {
  const existing = await prisma.carouselSlide.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Carousel slide not found");
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.tagline !== undefined) updateData.tagline = data.tagline?.trim() || null;
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim();
  if (data.route !== undefined) updateData.route = data.route?.trim() || "/courses";
  if (data.category !== undefined) updateData.category = data.category?.trim() || null;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return await prisma.carouselSlide.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete carousel slide by ID
 */
export const deleteCarouselSlide = async (id: string) => {
  const existing = await prisma.carouselSlide.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Carousel slide not found");
  }

  return await prisma.carouselSlide.delete({
    where: { id },
  });
};

/**
 * Bulk reorder carousel slides
 */
export const reorderCarouselSlides = async (slides: ReorderSlideItem[]) => {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error("Invalid slides array provided for reordering");
  }

  const updatePromises = slides.map((slide) => {
    return prisma.carouselSlide.update({
      where: { id: slide.id },
      data: { order: slide.order },
    });
  });

  await prisma.$transaction(updatePromises);

  return await prisma.carouselSlide.findMany({
    orderBy: { order: "asc" },
  });
};
