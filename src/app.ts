import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/course.routes";
import courseModuleRoutes from "./routes/course-module.routes";
import lessonRoutes from "./routes/lesson.routes";
import procedureRoutes from "./routes/procedure.routes";
import resourceRoutes from "./routes/resource.routes";
import businessGuidanceRoutes from "./routes/businessGuidance.routes";
import orderRoutes from "./routes/order.routes";

// BigInt JSON serialization fix for Express / Prisma
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173,https://course-website-f.vercel.app")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (process.env.FRONTEND_URL) {
  const normalizedFrontendUrl = process.env.FRONTEND_URL.trim().replace(/\/$/, "");
  if (!allowedOrigins.includes(normalizedFrontendUrl)) {
    allowedOrigins.push(normalizedFrontendUrl);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
setupSwagger(app);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/courses", courseModuleRoutes);
app.use("/api/v1/modules", lessonRoutes);
app.use("/api/v1/courses", procedureRoutes);
app.use("/api/v1/courses", resourceRoutes);
app.use("/api/v1/courses", businessGuidanceRoutes);
app.use("/api/v1/orders", orderRoutes);

export default app;