import { Router } from "express";
import courseRoutes from "./course.routes";
import enrollmentRoutes from "./enrollment.routes";
import blogRoutes from "./blog.routes";
import blogCategoryRoutes from "./blogCategory.routes";
const router = Router();

router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/blogs", blogRoutes);
router.use("/blog-categories", blogCategoryRoutes);
export default router;