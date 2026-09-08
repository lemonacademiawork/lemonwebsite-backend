# 🍋 Lemon Academia — REST API Documentation

Comprehensive reference documentation for the Lemon Academia REST API.

- **Base URL (Production)**: `https://lemonwebsite-backend.onrender.com/api/v1`
- **Base URL (Local)**: `http://localhost:5000/api/v1`
- **Interactive Swagger UI**: `https://lemonwebsite-backend.onrender.com/api-docs`

---

## 🔐 Authentication & Headers

Most protected endpoints require an **Authorization Header** containing a valid JWT Bearer access token:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

Roles supported: `STUDENT`, `TRAINER`, `ADMIN`.

---

## Table of Contents

1. [Authentication (`/auth`)](#1-authentication-apiauth)
2. [User Profile (`/users`)](#2-user-profile-apiusers)
3. [Courses (`/courses`)](#3-courses-apicourses)
4. [Course Modules (`/courses/:courseId/modules`)](#4-course-modules-apicoursescourseidmodules)
5. [Lessons (`/modules/:moduleId/lessons`)](#5-lessons-apimodulesmoduleidlessons)
6. [Procedures (`/courses/:courseId/procedures`)](#6-procedures-apicoursescourseidprocedures)
7. [Downloadable Resources (`/courses/:courseId/resources`)](#7-resources-apicoursescourseidresources)
8. [Business Guidance (`/courses/:courseId/guidance`)](#8-business-guidance-apicoursescourseidguidance)
9. [Categories (`/categories`)](#9-categories-apicategories)
10. [Orders (`/orders`)](#10-orders-apiorders)
11. [Payments & Razorpay (`/payments`)](#11-payments--razorpay-apipayments)
12. [Enrollments (`/enrollments`)](#12-enrollments-apienrollments)
13. [Reviews & Ratings (`/reviews`)](#13-reviews-apireviews)
14. [Gallery (`/gallery`)](#14-gallery-apigallery)
15. [File Uploads (`/upload`)](#15-file-uploads-apiupload)
16. [Blogs & Categories (`/blogs`, `/blog-categories`)](#16-blogs--categories-apiblogs-apiblog-categories)
17. [Certificates (`/certificates`)](#17-certificates-apicertificates)
18. [Referrals (`/referrals`)](#18-referrals-apireferrals)
19. [Student & Trainer Dashboards (`/students`, `/trainers`)](#19-student--trainer-dashboards-apistudents-apitrainers)
20. [Admin (`/admin`)](#20-admin-apiadmin)
21. [Coupons (`/coupons`)](#21-coupons-apicoupons)
22. [Trainer Applications (`/trainer-requests`)](#22-trainer-applications-apitrainer-requests)

---

## 1. Authentication (`/api/v1/auth`)

### 1.1 Register Student
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Auth**: Public

#### Request Body (Phone and/or Email)
```json
{
  "name": "Sejal Agarwal",
  "phone": "9876543210",
  "email": "sejal@example.com",
  "password": "Password123!"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "c1f7a08b-9e23-4567-8901-abcdef123456",
      "name": "Sejal Agarwal",
      "phone": "9876543210",
      "email": "sejal@example.com",
      "role": "STUDENT"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
    }
  }
}
```

---

### 1.2 Login (Phone OR Email)
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth**: Public

Users can log in with **Phone Number**, **Email Address**, or a generic **`identifier`** field:

#### Option A: Log in with Phone Number
```json
{
  "phone": "9876543210",
  "password": "Password123!"
}
```

#### Option B: Log in with Email Address
```json
{
  "email": "student@example.com",
  "password": "Password123!"
}
```

#### Option C: Log in with Identifier (supports either Phone or Email automatically)
```json
{
  "identifier": "admin@lemonacademy.com",
  "password": "Password123!"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c1f7a08b-9e23-4567-8901-abcdef123456",
      "name": "Sejal Agarwal",
      "phone": "9876543210",
      "email": "sejal@example.com",
      "role": "STUDENT",
      "avatarUrl": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
    }
  }
}
```

---

### 1.3 Refresh Access Token
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Auth**: Public (Requires refresh token in body or cookie)

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
}
```

---

### 1.4 Logout
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Auth**: Required (`Bearer <accessToken>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Get Authenticated User (`/me`)
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth**: Required (`Bearer <accessToken>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7a08b-9e23-4567-8901-abcdef123456",
    "name": "Sejal Agarwal",
    "phone": "9876543210",
    "email": "sejal@example.com",
    "role": "STUDENT",
    "isActive": true,
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
}
```

---

### 1.6 Forgot Password (Phone OR Email)
- **Method**: `POST`
- **Path**: `/api/v1/auth/forgot-password`
- **Auth**: Public

#### Request Body (by Phone, Email, or Identifier)
```json
{
  "phone": "9876543210"
}
```
*or*
```json
{
  "email": "student@example.com"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "message": "Password reset token generated successfully",
    "resetToken": "4e7a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
    "resetUrl": "https://course-website-f.vercel.app/reset-password?token=4e7a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f&phone=9876543210"
  }
}
```

---

### 1.7 Reset Password
- **Method**: `POST`
- **Path**: `/api/v1/auth/reset-password`
- **Auth**: Public

#### Request Body
```json
{
  "token": "4e7a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
  "newPassword": "NewSecurePassword123!",
  "phone": "9876543210"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

---

## 2. User Profile (`/api/v1/users`)

### 2.1 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/v1/users/me`
- **Auth**: Required

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7a08b-9e23-4567-8901-abcdef123456",
    "name": "Sejal Agarwal",
    "phone": "9876543210",
    "email": "sejal@example.com",
    "role": "STUDENT",
    "studentProfile": {
      "id": "s1a2b3c4-...",
      "phone": "9876543210",
      "bio": "Soap Making enthusiast",
      "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
    }
  }
}
```

---

### 2.2 Update Profile
- **Method**: `PATCH`
- **Path**: `/api/v1/users/me`
- **Auth**: Required

#### Request Body
```json
{
  "name": "Sejal Agarwal",
  "phone": "+919876543210",
  "bio": "Artisan candle & soap maker",
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "c1f7a08b-9e23-4567-8901-abcdef123456",
    "name": "Sejal Agarwal",
    "email": "sejal@example.com"
  }
}
```

---

### 2.3 Change Password
- **Method**: `PATCH`
- **Path**: `/api/v1/users/me/password`
- **Auth**: Required

#### Request Body
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 3. Courses (`/api/v1/courses`)

### 3.1 List Courses
- **Method**: `GET`
- **Path**: `/api/v1/courses`
- **Auth**: Public
- **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `search` (optional)
  - `categoryId` (optional)
  - `level` (optional: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
  - `isPublished` (optional, default: true)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
        "title": "Master Cold Process Soap Making",
        "slug": "master-cold-process-soap-making",
        "shortDescription": "Learn artisan soap formulations from scratch.",
        "thumbnailUrl": "https://res.cloudinary.com/.../soap.jpg",
        "price": 4999,
        "discountPrice": 2999,
        "level": "BEGINNER",
        "durationHours": 12,
        "isPublished": true,
        "category": {
          "id": "cat-1",
          "name": "Soap Making"
        },
        "trainer": {
          "user": {
            "name": "Shivani Sharma",
            "avatarUrl": "https://res.cloudinary.com/.../shivani.jpg"
          }
        },
        "_count": {
          "enrollments": 142,
          "reviews": 38
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3.2 Get Single Course Overview
- **Method**: `GET`
- **Path**: `/api/v1/courses/:id` (supports UUID or slug)
- **Auth**: Public

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "title": "Master Cold Process Soap Making",
    "slug": "master-cold-process-soap-making",
    "description": "Full step-by-step masterclass...",
    "price": 4999,
    "discountPrice": 2999,
    "modules": [
      {
        "id": "mod-1",
        "title": "Introduction to Lye Safety & Oils",
        "sortOrder": 1,
        "lessons": [
          {
            "id": "les-1",
            "title": "Safety Gear and Equipment",
            "durationMinutes": 15,
            "isFreePreview": true
          }
        ]
      }
    ]
  }
}
```

---

### 3.3 Get Full Course Curriculum (Enrolled / Creator)
- **Method**: `GET`
- **Path**: `/api/v1/courses/:id/full`
- **Auth**: Required

---

### 3.4 Create Course
- **Method**: `POST`
- **Path**: `/api/v1/courses`
- **Auth**: Trainer / Admin (`Bearer <token>`)

#### Request Body
```json
{
  "title": "Soy Candle Making & Aromatherapy",
  "categoryId": "cat-uuid-1234",
  "shortDescription": "Create eco-friendly scented candles.",
  "description": "Comprehensive course covering waxes, wicks, fragrance loads...",
  "price": 3999,
  "discountPrice": 2499,
  "level": "BEGINNER",
  "durationHours": 8,
  "thumbnailUrl": "https://res.cloudinary.com/.../candle.jpg",
  "previewVideoUrl": "https://res.cloudinary.com/.../preview.mp4"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "new-course-uuid",
    "title": "Soy Candle Making & Aromatherapy",
    "slug": "soy-candle-making-aromatherapy"
  }
}
```

---

### 3.5 Update Course
- **Method**: `PUT`
- **Path**: `/api/v1/courses/:id`
- **Auth**: Trainer (Owner) / Admin

---

### 3.6 Delete Course
- **Method**: `DELETE`
- **Path**: `/api/v1/courses/:id`
- **Auth**: Trainer (Owner) / Admin

---

## 4. Course Modules (`/api/v1/courses/:courseId/modules`)

- `POST /api/v1/courses/:courseId/modules` — Create module `{ "title": "...", "sortOrder": 1 }`
- `GET /api/v1/courses/:courseId/modules` — List modules of course
- `PUT /api/v1/courses/:courseId/modules/:moduleId` — Update module
- `DELETE /api/v1/courses/:courseId/modules/:moduleId` — Delete module

---

## 5. Lessons (`/api/v1/modules/:moduleId/lessons`)

- `POST /api/v1/modules/:moduleId/lessons` — Create lesson:
  ```json
  {
    "title": "Formulating Oil Ratios",
    "durationMinutes": 25,
    "videoUrl": "https://res.cloudinary.com/.../lesson.mp4",
    "content": "Detailed lesson notes and formula sheet.",
    "isFreePreview": false,
    "sortOrder": 1
  }
  ```
- `GET /api/v1/modules/:moduleId/lessons` — List lessons in module
- `GET /api/v1/modules/:moduleId/lessons/:lessonId` — Get lesson details & stream URL
- `PUT /api/v1/modules/:moduleId/lessons/:lessonId` — Update lesson
- `DELETE /api/v1/modules/:moduleId/lessons/:lessonId` — Delete lesson

---

## 6. Procedures (`/api/v1/courses/:courseId/procedures`)

Step-by-step actionable formulation guides.

- `POST /api/v1/courses/:courseId/procedures` — Add procedure step
- `GET /api/v1/courses/:courseId/procedures` — List procedures
- `PUT /api/v1/courses/:courseId/procedures/:procedureId` — Update procedure
- `DELETE /api/v1/courses/:courseId/procedures/:procedureId` — Delete procedure

---

## 7. Resources (`/api/v1/courses/:courseId/resources`)

Downloadable recipe cards, charts, and ingredient guides.

- `POST /api/v1/courses/:courseId/resources` — Add resource `{ "title": "...", "fileUrl": "...", "fileType": "PDF" }`
- `GET /api/v1/courses/:courseId/resources` — List downloadable files
- `PUT /api/v1/courses/:courseId/resources/:resourceId` — Update resource
- `DELETE /api/v1/courses/:courseId/resources/:resourceId` — Delete resource

---

## 8. Business Guidance (`/api/v1/courses/:courseId/guidance`)

Costing calculators, packaging, labeling, and selling strategies.

- `POST /api/v1/courses/:courseId/guidance` — Add guidance topic
- `GET /api/v1/courses/:courseId/guidance` — List business guidance
- `PUT /api/v1/courses/:courseId/guidance/:guidanceId` — Update guidance
- `DELETE /api/v1/courses/:courseId/guidance/:guidanceId` — Delete guidance

---

## 9. Categories (`/api/v1/categories`)

- `GET /api/v1/categories` — List all course categories (Public)
- `POST /api/v1/categories` — Create category (Admin)
- `PUT /api/v1/categories/:id` — Update category (Admin)
- `DELETE /api/v1/categories/:id` — Delete category (Admin)

---

## 10. Orders (`/api/v1/orders`)

### 10.1 Create Order
- **Method**: `POST`
- **Path**: `/api/v1/orders`
- **Auth**: Required (`STUDENT`)

#### Request Body
```json
{
  "courseId": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
  "orderNumber": "ORD-2026-0001",
  "amount": 2999,
  "currency": "INR",
  "appliedReferralCode": "LEMON10"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "ord-uuid-1234",
    "orderNumber": "ORD-2026-0001",
    "status": "PENDING",
    "amount": 2999
  }
}
```

### 10.2 List My Orders
- **Method**: `GET`
- **Path**: `/api/v1/orders`
- **Auth**: Required

### 10.3 Get Order by ID
- **Method**: `GET`
- **Path**: `/api/v1/orders/:orderId`
- **Auth**: Required

---

## 11. Payments & Razorpay (`/api/v1/payments`)

### 11.1 Create Razorpay Order
- **Method**: `POST`
- **Path**: `/api/v1/payments/create-razorpay-order`
- **Auth**: Required

#### Request Body
```json
{
  "amount": 2999,
  "currency": "INR",
  "receipt": "order_rcptid_11"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "order_RZP123456789",
    "amount": 299900,
    "currency": "INR"
  }
}
```

---

### 11.2 Record & Verify Payment
- **Method**: `POST`
- **Path**: `/api/v1/payments`
- **Auth**: Required

#### Request Body
```json
{
  "orderId": "ord-uuid-1234",
  "amount": 2999,
  "currency": "INR",
  "paymentMethod": "RAZORPAY",
  "razorpayPaymentId": "pay_RZP123456789",
  "razorpayOrderId": "order_RZP123456789",
  "razorpaySignature": "9ef8a...signature"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Payment verified and enrollment created",
  "data": {
    "paymentId": "pay-uuid-123",
    "status": "SUCCESS"
  }
}
```

---

### 11.3 Razorpay Webhook
- **Method**: `POST`
- **Path**: `/api/v1/payments/webhook`
- **Auth**: Handled via `x-razorpay-signature` Header

---

## 12. Enrollments (`/api/v1/enrollments`)

### 12.1 Get My Enrolled Courses
- **Method**: `GET`
- **Path**: `/api/v1/enrollments/my-courses`
- **Auth**: Required

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "enr-uuid-123",
      "enrolledAt": "2026-03-01T12:00:00.000Z",
      "progressPercentage": 45,
      "isCompleted": false,
      "course": {
        "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
        "title": "Master Cold Process Soap Making",
        "thumbnailUrl": "https://res.cloudinary.com/.../soap.jpg"
      }
    }
  ]
}
```

### 12.2 Check Enrollment Status
- **Method**: `GET`
- **Path**: `/api/v1/enrollments/check/:courseId`
- **Auth**: Required

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "isEnrolled": true,
    "enrollmentId": "enr-uuid-123"
  }
}
```

---

## 13. Reviews (`/api/v1/reviews` / `/api/v1/courses/:courseId/reviews`)

- `POST /api/v1/courses/:courseId/reviews` — Post course review `{ "rating": 5, "comment": "Amazing masterclass!" }`
- `GET /api/v1/courses/:courseId/reviews` — Get course reviews
- `PUT /api/v1/reviews/:reviewId` — Edit review
- `DELETE /api/v1/reviews/:reviewId` — Delete review

---

## 14. Gallery (`/api/v1/gallery`)

Artisan showcase of student soaps, candles, and skincare creations.

- `GET /api/v1/gallery` — Get all gallery creations (Public, support `category`, `tag`, pagination)
- `POST /api/v1/gallery` — Add creation `{ "title": "Lavender Swirl", "imageUrl": "...", "category": "Soap" }` (Trainer / Admin)
- `DELETE /api/v1/gallery/:id` — Delete gallery item (Trainer / Admin)

---

## 15. File Uploads (`/api/v1/upload`)

Direct Cloudinary storage endpoints. Form-data with field name `file`.

- `POST /api/v1/upload/image` — Upload image (JPG, PNG, WebP)
- `POST /api/v1/upload/video` — Upload video (MP4, MOV, WebM)
- `POST /api/v1/upload/document` — Upload PDF/Resource

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/ovxjar28/image/upload/v12345/sample.jpg",
    "publicId": "lemon_uploads/sample",
    "format": "jpg",
    "bytes": 204800
  }
}
```

---

## 16. Blogs & Categories (`/api/v1/blogs`, `/api/v1/blog-categories`)

- `GET /api/v1/blogs` — List published blogs
- `GET /api/v1/blogs/:id` — Get single blog (by ID or slug)
- `POST /api/v1/blogs` — Create blog (Admin / Trainer)
- `PUT /api/v1/blogs/:id` — Update blog (Admin / Trainer)
- `DELETE /api/v1/blogs/:id` — Delete blog (Admin / Trainer)
- `GET /api/v1/blog-categories` — List blog categories
- `POST /api/v1/blog-categories` — Create blog category (Admin)

---

## 17. Certificates (`/api/v1/certificates`)

- `GET /api/v1/certificates/:id` — Verify / View Certificate (Public)
- `POST /api/v1/certificates/generate` — Generate completion certificate for finished course

---

## 18. Referrals (`/api/v1/referrals`)

- `GET /api/v1/referrals/my-code` — Get authenticated user's unique referral code & share link
- `GET /api/v1/referrals/stats` — View total successful referrals & commission earnings

---

## 19. Student & Trainer Dashboards (`/api/v1/students`, `/api/v1/trainers`)

- `GET /api/v1/students/dashboard` — Student summary statistics (Enrolled courses, completed lessons, certificates)
- `GET /api/v1/students/certificates` — List student earned certificates
- `GET /api/v1/trainers` — List all public instructor profiles
- `GET /api/v1/trainers/:id` — Get instructor public bio and published courses
- `GET /api/v1/trainers/dashboard` — Instructor dashboard (Total students, revenue, course ratings)

---

## 20. Admin (`/api/v1/admin`)

Requires `ADMIN` role.

- `GET /api/v1/admin/stats` — Platform-wide revenue, student signups, total enrollments, active courses
- `GET /api/v1/admin/users` — List platform users with search & filters
- `PATCH /api/v1/admin/users/:id/status` — Ban or activate a user
- `GET /api/v1/admin/orders` — Platform-wide orders and financial ledger
- `GET /api/v1/admin/courses` — All courses with status
- `PATCH /api/v1/admin/courses/:id/status` — Approve, reject, or archive courses

---

## 21. Coupons (`/api/v1/coupons`)

### 21.1 Validate / Apply Coupon
- **Method**: `POST`
- **Path**: `/api/v1/coupons/validate`
- **Auth**: Public / Optional Auth

#### Request Body
```json
{
  "code": "LEMON20",
  "amount": 2999,
  "courseId": "c1f7a08b-9e23-4567-8901-abcdef123456"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "valid": true,
    "coupon": {
      "id": "cp1f7a08b-9e23-4567-8901-abcdef123456",
      "code": "LEMON20",
      "description": "20% off all artisan courses",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minOrderAmount": 999,
      "maxDiscountAmount": 1000,
      "courseId": null,
      "courseTitle": null
    },
    "originalAmount": 2999,
    "discountAmount": 599.8,
    "finalAmount": 2399.2
  }
}
```

### 21.2 Get Active Public Coupons
- **Method**: `GET`
- **Path**: `/api/v1/coupons/public`
- **Auth**: Public
- **Query Params**: `courseId` (optional)

### 21.3 Admin Coupon Management
- `GET /api/v1/coupons` — List all coupons (Admin, pagination & search)
- `POST /api/v1/coupons` — Create a new discount coupon (Admin)
- `GET /api/v1/coupons/:id` — View coupon details & usage stats (Admin)
- `PATCH /api/v1/coupons/:id` — Update coupon parameters (Admin)
- `DELETE /api/v1/coupons/:id` — Delete coupon (Admin)

---

## 22. Trainer Applications (`/api/v1/trainer-requests`)

### 22.1 Submit "Become a Trainer" Application
- **Method**: `POST`
- **Path**: `/api/v1/trainer-requests`
- **Auth**: Public / Optional Bearer token

#### Request Body
```json
{
  "name": "Priya Sharma",
  "phone": "9876543210",
  "email": "priya@example.com",
  "expertise": "Modern Crochet & Amigurumi",
  "experienceYears": 6,
  "bio": "Certified fiber artist with 6 years of experience running craft workshops.",
  "portfolioUrl": "https://instagram.com/crochet_priya",
  "sampleVideoUrl": "https://youtube.com/watch?v=sample123",
  "resumeUrl": "https://drive.google.com/file/d/sample"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Your application to become a trainer has been submitted successfully",
  "data": {
    "id": "tr1f7a08b-9e23-4567-8901-abcdef123456",
    "name": "Priya Sharma",
    "phone": "9876543210",
    "email": "priya@example.com",
    "expertise": "Modern Crochet & Amigurumi",
    "experienceYears": 6,
    "status": "PENDING",
    "createdAt": "2026-03-01T12:00:00.000Z"
  }
}
```

### 22.2 My Trainer Applications
- **Method**: `GET`
- **Path**: `/api/v1/trainer-requests/me`
- **Auth**: Required (`Bearer <token>`)

### 22.3 Admin Trainer Application Management
- `GET /api/v1/trainer-requests` — List all applications (Admin, filter by status: `PENDING`, `APPROVED`, `REJECTED`)
- `GET /api/v1/trainer-requests/:id` — Get full application details (Admin)
- `PATCH /api/v1/trainer-requests/:id/status` — Review application (`status: APPROVED | REJECTED`, `adminNotes`). *Note: Approving automatically elevates user role to `TRAINER` and initializes `TrainerProfile`.*
- `DELETE /api/v1/trainer-requests/:id` — Delete application (Admin)

