import { Router } from "express";
import {
    createProcedureController,
    getProceduresController, updateProcedureController, deleteProcedureController
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
/**
 * @swagger
 * /api/v1/courses/{courseId}/procedures:
 *   get:
 *     summary: Get all procedures of a course
 *     tags: [Procedures]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 */
router.get(
    "/:courseId/procedures",
    getProceduresController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/procedures/{procedureId}:
 *   patch:
 *     summary: Update a procedure
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
 *       - in: path
 *         name: procedureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Procedure ID
 */
router.patch(
    "/:courseId/procedures/:procedureId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    updateProcedureController
);
/**
 * @swagger
 * /api/v1/courses/{courseId}/procedures/{procedureId}:
 *   delete:
 *     summary: Delete a procedure
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
 *       - in: path
 *         name: procedureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Procedure ID
 */
router.delete(
    "/:courseId/procedures/:procedureId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteProcedureController
);
export default router;