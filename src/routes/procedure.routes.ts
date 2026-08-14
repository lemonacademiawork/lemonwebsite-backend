import { Router } from "express";

import {
    createProcedureController,
} from "../controllers/procedure.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/courses/{courseId}/procedures:
 *   post:
 *     summary: Create a procedure
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 */
router.post(
    "/:courseId/procedures",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    createProcedureController
);

export default router;