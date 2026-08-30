import { Router } from "express";
import courseRoutes from "./course.routes";
import enrollmentRoutes from "./enrollment.routes";
import blogRoutes from "./blog.routes";
import studentRoutes from "./student.routes";
import certificateRoutes from "./certificate.routes";

const router = Router();

router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/blogs", blogRoutes);
router.use("/students", studentRoutes);
router.use("/certificates", certificateRoutes);

export default router;