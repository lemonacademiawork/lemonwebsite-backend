import { Router } from "express";
import courseRoutes from "./course.routes";
import enrollmentRoutes from "./enrollment.routes";
import blogRoutes from "./blog.routes";
import blogCategoryRoutes from "./blogCategory.routes";
import studentRoutes from "./student.routes";
import certificateRoutes from "./certificate.routes";
import trainerRoutes from "./trainer.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/blogs", blogRoutes);
router.use("/blog-categories", blogCategoryRoutes);
router.use("/students", studentRoutes);
router.use("/certificates", certificateRoutes);
router.use("/trainers", trainerRoutes);
router.use("/admin", adminRoutes);

export default router;