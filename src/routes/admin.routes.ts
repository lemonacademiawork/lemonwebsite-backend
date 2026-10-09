import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
    getAdminDashboardController,
    getAdminUsersController,
    getAdminUserByIdController,
    updateUserRoleController,
    updateUserStatusController,
    getAdminEnrollmentsController,
    createManualEnrollmentController,
    updateEnrollmentStatusController,
    getAdminGallerySubmissionsController,
    moderateGallerySubmissionController,
    getAdminSystemSettingsController,
    upsertSystemSettingController,
    createAdminTrainerController,
    getAdminTrainersController,
    getAdminTrainerByIdController,
    updateAdminTrainerController,
    deleteAdminTrainerController,
} from "../controllers/admin.controller";

const router = Router();

// Apply global authenticate and requireRoles("ADMIN") to all admin routes
router.use(authenticate, requireRoles("ADMIN"));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get administrative overview and dashboard metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get("/dashboard", getAdminDashboardController);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users with pagination, search, and filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [STUDENT, TRAINER, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get("/users", getAdminUsersController);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get full user details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/users/:id", getAdminUserByIdController);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [STUDENT, TRAINER, ADMIN]
 *                 example: TRAINER
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or request
 */
router.patch("/users/:id/role", updateUserRoleController);

/**
 * @swagger
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user active/inactive status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid request
 */
router.patch("/users/:id/status", updateUserStatusController);

/**
 * @swagger
 * /api/v1/admin/enrollments:
 *   get:
 *     summary: List all enrollments across all courses
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, EXPIRED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Enrollments fetched successfully
 */
router.get("/enrollments", getAdminEnrollmentsController);

/**
 * @swagger
 * /api/v1/admin/enrollments:
 *   post:
 *     summary: Manually enroll a student in a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - courseId
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: "student-uuid-here"
 *               courseId:
 *                 type: string
 *                 example: "course-uuid-here"
 *     responses:
 *       201:
 *         description: Manual enrollment created successfully
 *       400:
 *         description: Invalid request or already enrolled
 */
router.post("/enrollments", createManualEnrollmentController);

/**
 * @swagger
 * /api/v1/admin/enrollments/{id}/status:
 *   patch:
 *     summary: Update enrollment status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED, EXPIRED]
 *                 example: SUSPENDED
 *     responses:
 *       200:
 *         description: Enrollment status updated successfully
 */
router.patch("/enrollments/:id/status", updateEnrollmentStatusController);

/**
 * @swagger
 * /api/v1/admin/gallery:
 *   get:
 *     summary: List all gallery submissions for moderation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Gallery submissions fetched successfully
 */
router.get("/gallery", getAdminGallerySubmissionsController);

/**
 * @swagger
 * /api/v1/admin/gallery/{id}/moderate:
 *   patch:
 *     summary: Moderate a gallery submission (Approve / Reject)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gallery submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, PENDING]
 *                 example: APPROVED
 *               adminFeedback:
 *                 type: string
 *                 example: Excellent craftsmanship! Approved for featured showcase.
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Gallery submission moderated successfully
 */
router.patch("/gallery/:id/moderate", moderateGallerySubmissionController);



/**
 * @swagger
 * /api/v1/admin/settings:
 *   get:
 *     summary: Get all system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings fetched successfully
 */
router.get("/settings", getAdminSystemSettingsController);

/**
 * @swagger
 * /api/v1/admin/settings:
 *   put:
 *     summary: Upsert a system setting key-value pair
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - settingKey
 *               - settingValue
 *             properties:
 *               settingKey:
 *                 type: string
 *                 example: "MAINTENANCE_MODE"
 *               settingValue:
 *                 type: string
 *                 example: "false"
 *               description:
 *                 type: string
 *                 example: "Enables platform maintenance mode"
 *     responses:
 *       200:
 *         description: System setting saved successfully
 */
router.put("/settings", upsertSystemSettingController);

/**
 * @swagger
 * /api/v1/admin/trainers:
 *   post:
 *     summary: Directly add/create a trainer (Admin only)
 *     description: Creates a new trainer account and TrainerProfile directly, or upgrades an existing user to Trainer. Generates login credentials if no password is provided.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Priya Sharma
 *               email:
 *                 type: string
 *                 example: priya@lemonacademy.in
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "Trainer@123456"
 *                 description: Optional. A secure temporary password is auto-generated if omitted.
 *               expertise:
 *                 type: string
 *                 example: "Modern Crochet & Amigurumi"
 *               designation:
 *                 type: string
 *                 example: "Lead Fiber Artist & Instructor"
 *               bio:
 *                 type: string
 *                 example: "Over 8 years of teaching crochet, macrame, and fiber crafts."
 *               avatarUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
 *     responses:
 *       201:
 *         description: Trainer created or upgraded successfully
 *       400:
 *         description: Missing fields or invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.post("/trainers", createAdminTrainerController);

/**
 * @swagger
 * /api/v1/admin/trainers:
 *   get:
 *     summary: List all trainers with course counts and metrics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone, or expertise
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Trainers list fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get("/trainers", getAdminTrainersController);

/**
 * @swagger
 * /api/v1/admin/trainers/{id}:
 *   get:
 *     summary: Get trainer details, profile, and taught courses (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or TrainerProfile ID
 *     responses:
 *       200:
 *         description: Trainer details fetched successfully
 *       404:
 *         description: Trainer not found
 */
router.get("/trainers/:id", getAdminTrainerByIdController);

/**
 * @swagger
 * /api/v1/admin/trainers/{id}:
 *   patch:
 *     summary: Update trainer profile or account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or TrainerProfile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Reset trainer password if provided (min 6 chars)
 *               expertise:
 *                 type: string
 *               designation:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trainer updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Trainer not found
 */
router.patch("/trainers/:id", updateAdminTrainerController);

/**
 * @swagger
 * /api/v1/admin/trainers/{id}:
 *   delete:
 *     summary: Remove trainer role or delete profile (Admin only)
 *     description: If the trainer has active courses, account is safely deactivated and role changed to STUDENT to preserve enrollments.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or TrainerProfile ID
 *     responses:
 *       200:
 *         description: Trainer role revoked successfully
 *       404:
 *         description: Trainer not found
 */
router.delete("/trainers/:id", deleteAdminTrainerController);

export default router;
