import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lemon Academia API",
      version: "1.0.0",
      description:
        "Production-ready backend API documentation for Lemon Academia course platform",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            name: {
              type: "string",
              example: "Crochet Basics",
            },
            slug: {
              type: "string",
              example: "crochet-basics",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Foundational techniques and stitch patterns for beginners.",
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example: "https://images.unsplash.com/photo-1584992236310-6edddc08acff",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Authentication and authorization APIs",
      },
      {
        name: "Users",
        description: "User profile APIs",
      },
      {
        name: "Students",
        description: "Student portal, progress, and dashboard APIs",
      },
      {
        name: "Trainers",
        description: "Trainer profile and course management APIs",
      },
      {
        name: "Admin",
        description: "Administrative dashboard, user management, enrollment, and moderation APIs",
      },
      {
        name: "Courses",
        description: "Course management APIs",
      },
      {
        name: "Categories",
        description: "Course category management APIs",
      },
      {
        name: "Course Modules",
        description: "Course module structure APIs",
      },
      {
        name: "Lessons",
        description: "Course lesson video & content APIs",
      },
      {
        name: "Business Guidance",
        description: "Business guidance and advisory APIs",
      },
      {
        name: "Resources",
        description: "Downloadable course resources APIs",
      },
      {
        name: "Procedures",
        description: "Course step-by-step procedures APIs",
      },
      {
        name: "Enrollments",
        description: "Student course enrollment APIs",
      },
      {
        name: "Orders",
        description: "Course purchase order APIs",
      },
      {
        name: "Payments",
        description: "Payment transactions and verification APIs",
      },
      {
        name: "Certificates",
        description: "Student course completion certificate APIs",
      },
      {
        name: "Blogs",
        description: "Blog publishing and article APIs",
      },
      {
        name: "Blog Categories",
        description: "Blog category management APIs",
      },
      {
        name: "Reviews",
        description: "Course ratings, reviews, and moderation APIs",
      },
      {
        name: "Gallery",
        description: "Student work showcase, project submissions, and admin moderation APIs",
      },
      {
        name: "Carousel",
        description: "Homepage hero carousel and banner slides APIs",
      },
      {
        name: "Admin Carousel",
        description: "Admin hero carousel and banner management APIs",
      },
      {
        name: "Coupons",
        description: "Discount coupon creation and validation APIs",
      },
      {
        name: "Trainer Requests",
        description: "Trainer application workflow APIs",
      },
    ],
  },
  apis: [
    path.join(process.cwd(), "src/routes/**/*.ts").replace(/\\/g, "/"),
    path.join(process.cwd(), "src/controllers/**/*.ts").replace(/\\/g, "/"),
    path.join(process.cwd(), "src/routes/**/*.js").replace(/\\/g, "/"),
    path.join(process.cwd(), "src/controllers/**/*.js").replace(/\\/g, "/"),
  ],
};

export const getSwaggerSpec = () => {
  return swaggerJsdoc(options);
};

export const setupSwagger = (app: Express): void => {
  const swaggerSpec = getSwaggerSpec();

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  app.get("/api-docs-json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(getSwaggerSpec());
  });

  console.log(
    "Swagger UI available at http://localhost:5000/api-docs"
  );
};

export default setupSwagger;
