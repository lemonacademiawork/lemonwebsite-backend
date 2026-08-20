import { Router } from "express";
import {
    createProcedureController,
    getProceduresController,
    updateProcedureController,
    deleteProcedureController
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - contentText
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Lye Solution Safety Procedure"
 *               contentText:
 *                 type: string
 *                 example: "Always add lye to water slowly while stirring in a ventilated area."
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *               lessonId:
 *                 type: string
 *                 example: "lesson-12345"
 *     responses:
 *       201:
 *         description: Procedure created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to add procedure
 *       404:
 *         description: Course or linked lesson not found
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
 *     responses:
 *       200:
 *         description: Procedures retrieved successfully
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Lye Handling Procedure"
 *               contentText:
 *                 type: string
 *                 example: "Updated safety step instructions for handling sodium hydroxide."
 *               orderIndex:
 *                 type: integer
 *                 example: 2
 *               lessonId:
 *                 type: string
 *                 example: "lesson-12345"
 *     responses:
 *       200:
 *         description: Procedure updated successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to update procedure
 *       404:
 *         description: Course or Procedure not found
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
 *     responses:
 *       200:
 *         description: Procedure deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden to delete procedure
 *       404:
 *         description: Course or Procedure not found
 */
router.delete(
    "/:courseId/procedures/:procedureId",
    authenticate,
    requireRoles("ADMIN", "TRAINER"),
    deleteProcedureController
);

export default router;