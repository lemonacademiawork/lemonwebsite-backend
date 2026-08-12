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
    ],
  },
  apis: [
    path.join(process.cwd(), "src/routes/**/*.ts").replace(/\\/g, "/"),
    path.join(process.cwd(), "src/routes/**/*.js").replace(/\\/g, "/"),
  ],
};

const swaggerSpec = swaggerJsdoc(options) as { paths?: Record<string, unknown> };

console.log(
  "Swagger paths:",
  Object.keys(swaggerSpec.paths || {})
);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  console.log(
    "Swagger UI available at http://localhost:5000/api-docs"
  );
};

export default setupSwagger;
