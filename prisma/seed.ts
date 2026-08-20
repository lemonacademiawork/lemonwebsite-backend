import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Lemon Academy database seeding...");

  // 1. Create Trainer / Admin User
  const passwordHash = await bcrypt.hash("Password123!", 10);
  
  const trainerUser = await prisma.user.upsert({
    where: { email: "trainer@lemonacademy.com" },
    update: {},
    create: {
      name: "Chef & Craft Specialist Elena",
      email: "trainer@lemonacademy.com",
      passwordHash,
      role: UserRole.TRAINER,
      isActive: true,
      trainerProfile: {
        create: {
          firstName: "Elena",
          lastName: "Rostova",
          expertise: "Master Baker & Craft Artisan",
          designation: "Head Instructor at Lemon Academy",
          bio: "Passionate artisan with over 12 years of experience in creative arts, gourmet baking, and handmade soap creation.",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
        },
      },
    },
  });

  console.log(`✅ Trainer user created: ${trainerUser.email}`);

  // 2. Create Categories
  const categoriesData = [
    {
      name: "Crochet & Fiber Arts",
      slug: "crochet-fiber-arts",
      description: "Master the art of crocheting cozy garments, plush amigurumi, and modern home decor.",
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&q=80",
    },
    {
      name: "Baking & Confectionery",
      slug: "baking-confectionery",
      description: "Learn professional pastry techniques, artisanal sourdough, and gourmet cake design.",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    },
    {
      name: "Handcrafted Cosmetics",
      slug: "handcrafted-cosmetics",
      description: "Formulate natural organic soaps, botanical bath bombs, and luxury skincare at home.",
      imageUrl: "https://images.unsplash.com/photo-1607006482602-76ca0fd2f88d?w=600&q=80",
    },
    {
      name: "Pottery & Ceramic Craft",
      slug: "pottery-ceramic-craft",
      description: "Discover wheel throwing, handbuilding techniques, and custom ceramic glazing.",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories.push(createdCat);
  }
  console.log(`✅ ${categories.length} Categories created.`);

  // 3. Courses Data
  const coursesData = [
    {
      title: "Mastering Modern Crochet: From Stitches to Sweaters",
      slug: "mastering-modern-crochet",
      description: "Step into the soothing world of crochet! This comprehensive course takes you from beginner slipknots to crafting modern, wearable garments and charming plushies. Learn stitch math, pattern reading, and finishing techniques.",
      price: 2999.00,
      discountedPrice: 1499.00,
      thumbnailUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80",
      isPublished: true,
      categoryId: categories[0].id,
      trainerId: trainerUser.id,
      modules: [
        {
          title: "Module 1: Foundations of Crochet",
          description: "Understanding hooks, yarn weights, and essential beginner stitches.",
          orderIndex: 1,
          lessons: [
            {
              title: "Welcome & Selecting Your Tools",
              description: "Overview of hooks sizes, yarn types, and tension control.",
              videoId: "v1620000000/crochet_intro",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              durationSeconds: 420,
              isPreview: true,
              orderIndex: 1,
            },
            {
              title: "Single & Double Crochet Mastery",
              description: "Step-by-step guidance on consistent stitch height and neat edges.",
              videoId: "v1620000000/crochet_stitches",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              durationSeconds: 680,
              isPreview: false,
              orderIndex: 2,
            },
          ],
        },
        {
          title: "Module 2: Crafting Your First Garment",
          description: "Reading sweater patterns and assembling modern pieces.",
          orderIndex: 2,
          lessons: [
            {
              title: "Reading Crochet Charts & Swatching",
              description: "How to check gauge so your finished sweater fits perfectly.",
              videoId: "v1620000000/crochet_gauge",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              durationSeconds: 510,
              isPreview: false,
              orderIndex: 1,
            },
          ],
        },
      ],
    },
    {
      title: "Artisanal Sourdough & French Pastry Masterclass",
      slug: "artisanal-sourdough-french-pastry",
      description: "Unlock the secrets of sourdough starters, long fermentation, open crumb, and buttery flaky croissants. Designed for home bakers seeking bakery-quality results.",
      price: 3999.00,
      discountedPrice: 1999.00,
      thumbnailUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
      isPublished: true,
      categoryId: categories[1].id,
      trainerId: trainerUser.id,
      modules: [
        {
          title: "Module 1: Building a Wild Sourdough Starter",
          description: "Feeding schedules, hydration ratios, and flour selection.",
          orderIndex: 1,
          lessons: [
            {
              title: "Day 1 to 7: Starter Chemistry & Fermentation",
              description: "Understanding wild yeast and monitoring bubble activity.",
              videoId: "v1620000000/sourdough_starter",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
              durationSeconds: 600,
              isPreview: true,
              orderIndex: 1,
            },
          ],
        },
        {
          title: "Module 2: Shaping & Baking the Perfect Loaf",
          description: "Autolyse, stretch & folds, scoring, and Dutch oven baking.",
          orderIndex: 2,
          lessons: [
            {
              title: "Scoring Techniques for Maximum Oven Spring",
              description: "Razor blade angles for ear formation and golden crust.",
              videoId: "v1620000000/sourdough_baking",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
              durationSeconds: 750,
              isPreview: false,
              orderIndex: 1,
            },
          ],
        },
      ],
    },
    {
      title: "Cold Process Organic Soap Making & Botanical Skincare",
      slug: "cold-process-organic-soap-making",
      description: "Create luxurious natural soaps using plant oils, essential oils, and organic botanicals. Learn lye safety, oil formulation ratios, swirling designs, and curing secrets.",
      price: 2499.00,
      discountedPrice: 1299.00,
      thumbnailUrl: "https://images.unsplash.com/photo-1607006482602-76ca0fd2f88d?w=800&q=80",
      isPublished: true,
      categoryId: categories[2].id,
      trainerId: trainerUser.id,
      modules: [
        {
          title: "Module 1: Soap Chemistry & Safety Protocol",
          description: "Understanding oils, SAP values, lye safety, and essential equipment.",
          orderIndex: 1,
          lessons: [
            {
              title: "Lye Handling & Protective Gear Essentials",
              description: "Safe mixing techniques and room ventilation.",
              videoId: "v1620000000/soap_safety",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
              durationSeconds: 480,
              isPreview: true,
              orderIndex: 1,
            },
          ],
        },
      ],
    },
  ];

  for (const courseItem of coursesData) {
    const { modules, ...courseDetails } = courseItem;
    
    // Check if course already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseDetails.slug },
    });

    if (!existingCourse) {
      const course = await prisma.course.create({
        data: {
          ...courseDetails,
          modules: {
            create: modules.map((mod) => ({
              title: mod.title,
              description: mod.description,
              orderIndex: mod.orderIndex,
              isPublished: true,
              lessons: {
                create: mod.lessons.map((les) => ({
                  title: les.title,
                  description: les.description,
                  videoId: les.videoId,
                  videoUrl: les.videoUrl,
                  durationSeconds: les.durationSeconds,
                  isPreview: les.isPreview,
                  orderIndex: les.orderIndex,
                  isPublished: true,
                })),
              },
            })),
          },
        },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      });

      console.log(`✅ Created course: "${course.title}" with ${course.modules.length} modules.`);
    } else {
      console.log(`ℹ️ Course "${courseDetails.title}" already exists.`);
    }
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
