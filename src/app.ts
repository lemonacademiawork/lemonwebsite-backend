import express from "express";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/course.routes";
import courseModuleRoutes from "./routes/course-module.routes";
import lessonRoutes from "./routes/lesson.routes";
import procedureRoutes from "./routes/procedure.routes";
const app = express();

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
export default app;