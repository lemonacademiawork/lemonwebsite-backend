import express from "express";
import routes from "./routes";
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
import paymentRoutes from "./routes/payment.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import reviewRoutes from "./routes/review.routes";
import galleryRoutes from "./routes/gallery.routes";
import uploadRoutes from "./routes/upload.routes";
import couponRoutes from "./routes/coupon.routes";
import trainerRequestRoutes from "./routes/trainerRequest.routes";
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

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/courses", reviewRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/trainer-requests", trainerRequestRoutes);
app.use("/api/v1", routes);

// Global error handling middleware (handles JSON syntax errors from body-parser)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
    });
  }
  console.error("Unhandled error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;