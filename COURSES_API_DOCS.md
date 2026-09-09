# 🍋 Lemon Academia — Courses API Documentation

Complete API reference dedicated exclusively to **Courses, Curriculum, Classroom, and Progress**.

---

## 1. 🌐 API Overview & Headers

- **Production Base URL**: `https://api.lemonhousecraft.in/api/v1`
- **Local Base URL**: `http://localhost:5000/api/v1`

### Request Headers
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>   # (When authentication is required)
Content-Type: application/json
```

---

## 2. 📚 Course API Endpoints Summary

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/courses` | `GET` | Public | List published courses with filters & pagination |
| `/api/v1/courses/slug/:slug` | `GET` | Public | Get single course details by URL slug |
| `/api/v1/courses/:id` | `GET` | Public | Get single course details by ID |
| `/api/v1/courses/:id/content` | `GET` | Enrolled | Get full classroom curriculum (videos & lessons) |
| `/api/v1/courses/:courseId/enrollment-status` | `GET` | Required | Check if student is enrolled in course |
| `/api/v1/courses/:courseId/progress` | `GET` | Required | Get student's completion progress for course |
| `/api/v1/courses` | `POST` | Trainer/Admin | Create a new course |
| `/api/v1/courses/:id` | `PUT` | Trainer/Admin | Update course details |
| `/api/v1/courses/:id` | `DELETE` | Trainer/Admin | Delete course |
| `/api/v1/courses/:id/publish` | `PATCH` | Trainer/Admin | Toggle course published state |

---

## 3. 🔍 Detailed Endpoint Reference

### 3.1 List Courses
- **Method**: `GET`
- **Path**: `/api/v1/courses`
- **Auth**: Public

#### Query Parameters
- `page` (number, default: `1`): Page number
- `limit` (number, default: `10`): Items per page
- `search` (string, optional): Search keyword for course title / description
- `categoryId` (string, optional): Filter by Category UUID
- `level` (string, optional): `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, or `ALL_LEVELS`
- `isPublished` (boolean, optional, default: `true`): Published status

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
        "thumbnailUrl": "https://res.cloudinary.com/ovxjar28/image/upload/soap.jpg",
        "price": 4999,
        "discountPrice": 2999,
        "level": "BEGINNER",
        "durationHours": 12,
        "isPublished": true,
        "category": {
          "id": "cat-soap-101",
          "name": "Soap Making",
          "slug": "soap-making"
        },
        "trainer": {
          "id": "trainer-uuid-1234",
          "user": {
            "name": "Shivani Sharma",
            "avatarUrl": "https://res.cloudinary.com/ovxjar28/image/upload/trainer.jpg"
          }
        },
        "_count": {
          "enrollments": 142,
          "reviews": 38
        }
      }
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 3.2 Get Course Details by Slug
- **Method**: `GET`
- **Path**: `/api/v1/courses/slug/:slug` (or `/api/v1/courses/:id`)
- **Auth**: Public

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "title": "Master Cold Process Soap Making",
    "slug": "master-cold-process-soap-making",
    "shortDescription": "Learn artisan soap formulations from scratch.",
    "description": "Full step-by-step masterclass covering chemistry, lye safety, and batch curing.",
    "price": 4999,
    "discountPrice": 2999,
    "thumbnailUrl": "https://res.cloudinary.com/ovxjar28/image/upload/soap.jpg",
    "previewVideoUrl": "https://res.cloudinary.com/ovxjar28/video/upload/preview.mp4",
    "level": "BEGINNER",
    "durationHours": 12,
    "language": "Hindi / English",
    "category": {
      "id": "cat-soap-101",
      "name": "Soap Making",
      "slug": "soap-making"
    },
    "trainer": {
      "id": "trainer-uuid-1234",
      "bio": "Certified cosmetologist with 8+ years crafting natural luxury soaps.",
      "user": {
        "name": "Shivani Sharma",
        "avatarUrl": "https://res.cloudinary.com/ovxjar28/image/upload/trainer.jpg"
      }
    },
    "modules": [
      {
        "id": "mod-1",
        "title": "Module 1: Chemistry & Safety Foundations",
        "sortOrder": 1,
        "lessons": [
          {
            "id": "les-1",
            "title": "Introduction & Lye Safety Equipment",
            "durationMinutes": 15,
            "isFreePreview": true,
            "sortOrder": 1
          },
          {
            "id": "les-2",
            "title": "Understanding Fatty Acid Profiles",
            "durationMinutes": 22,
            "isFreePreview": false,
            "sortOrder": 2
          }
        ]
      }
    ]
  }
}
```

---

### 3.3 Check Enrollment Status
- **Method**: `GET`
- **Path**: `/api/v1/courses/:courseId/enrollment-status`
- **Auth**: Required (`Bearer <token>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Enrollment status retrieved successfully",
  "data": {
    "courseId": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "courseTitle": "Master Cold Process Soap Making",
    "enrolled": true,
    "enrollment": {
      "id": "enr-7890",
      "status": "ACTIVE",
      "source": "ONLINE_PAYMENT",
      "enrolledAt": "2026-03-01T10:00:00.000Z",
      "createdAt": "2026-03-01T10:00:00.000Z"
    }
  }
}
```

---

### 3.4 Get Full Course Content (Enrolled Students Only)
- **Method**: `GET`
- **Path**: `/api/v1/courses/:id/content`
- **Auth**: Required (`Bearer <token>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "title": "Master Cold Process Soap Making",
    "modules": [
      {
        "id": "mod-1",
        "title": "Module 1: Chemistry & Safety Foundations",
        "sortOrder": 1,
        "lessons": [
          {
            "id": "les-1",
            "title": "Introduction & Lye Safety Equipment",
            "durationMinutes": 15,
            "videoUrl": "https://res.cloudinary.com/ovxjar28/video/upload/v1/lesson1.mp4",
            "content": "<p>Always wear safety goggles and nitrile gloves when handling sodium hydroxide.</p>",
            "sortOrder": 1,
            "isCompleted": true
          }
        ]
      }
    ],
    "procedures": [
      {
        "id": "proc-1",
        "stepNumber": 1,
        "title": "Dissolving Sodium Hydroxide",
        "instructions": "Add lye crystals to cold distilled water gradually while stirring.",
        "imageUrl": "https://res.cloudinary.com/ovxjar28/image/upload/proc1.jpg"
      }
    ],
    "resources": [
      {
        "id": "res-1",
        "title": "Soap Lye Calculation Sheet (Excel)",
        "fileUrl": "https://res.cloudinary.com/ovxjar28/raw/upload/soap_calc.xlsx",
        "fileType": "SHEET"
      }
    ],
    "guidance": [
      {
        "id": "gd-1",
        "title": "How to price your handcrafted soap bars",
        "content": "Use the formula: Base Cost (Oils + Lye + Fragrance) * 4 for retail selling price."
      }
    ]
  }
}
```

---

### 3.5 Get Course Progress
- **Method**: `GET`
- **Path**: `/api/v1/courses/:courseId/progress`
- **Auth**: Required (`Bearer <token>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Course progress retrieved successfully",
  "data": {
    "courseId": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "courseTitle": "Master Cold Process Soap Making",
    "totalLessons": 10,
    "completedLessons": 4,
    "progressPercentage": 40,
    "lessonProgress": [
      {
        "lessonId": "les-1",
        "isCompleted": true,
        "watchedDurationSeconds": 900,
        "lastAccessedAt": "2026-03-02T14:20:00.000Z"
      }
    ]
  }
}
```

---

## 4. ✏️ Course Management APIs (Trainer / Admin)

### 4.1 Create Course
- **Method**: `POST`
- **Path**: `/api/v1/courses`
- **Auth**: Required (`TRAINER` / `ADMIN`)

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
  "thumbnailUrl": "https://res.cloudinary.com/ovxjar28/image/upload/candle.jpg",
  "previewVideoUrl": "https://res.cloudinary.com/ovxjar28/video/upload/preview.mp4"
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

### 4.2 Update Course
- **Method**: `PUT`
- **Path**: `/api/v1/courses/:id`
- **Auth**: Required (`TRAINER` Owner / `ADMIN`)

#### Request Body
```json
{
  "title": "Advanced Cold Process Soap Making",
  "price": 5499,
  "discountPrice": 3499,
  "level": "ADVANCED"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "title": "Advanced Cold Process Soap Making"
  }
}
```

---

### 4.3 Delete Course
- **Method**: `DELETE`
- **Path**: `/api/v1/courses/:id`
- **Auth**: Required (`TRAINER` Owner / `ADMIN`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### 4.4 Toggle Course Publish Status
- **Method**: `PATCH`
- **Path**: `/api/v1/courses/:id/publish`
- **Auth**: Required (`TRAINER` Owner / `ADMIN`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Course publish status toggled",
  "data": {
    "id": "f27eaa14-4e8b-4138-8c12-1324ca910e9b",
    "isPublished": true
  }
}
```

---

## 5. 🧩 Sub-Resources: Modules, Lessons, Procedures, Resources, Guidance

### Modules (`/api/v1/courses/:courseId/modules`)
- `GET /api/v1/courses/:courseId/modules` — List modules of course
- `POST /api/v1/courses/:courseId/modules` — Create module `{ "title": "Module Name", "sortOrder": 1 }`
- `PUT /api/v1/courses/:courseId/modules/:moduleId` — Update module
- `DELETE /api/v1/courses/:courseId/modules/:moduleId` — Delete module

### Lessons (`/api/v1/modules/:moduleId/lessons`)
- `GET /api/v1/modules/:moduleId/lessons` — List lessons in module
- `GET /api/v1/modules/:moduleId/lessons/:lessonId` — Get lesson details & stream URL
- `POST /api/v1/modules/:moduleId/lessons` — Create lesson:
  ```json
  {
    "title": "Lesson Title",
    "durationMinutes": 20,
    "videoUrl": "https://res.cloudinary.com/.../video.mp4",
    "content": "Lesson notes text or HTML",
    "isFreePreview": false,
    "sortOrder": 1
  }
  ```
- `PUT /api/v1/modules/:moduleId/lessons/:lessonId` — Update lesson
- `DELETE /api/v1/modules/:moduleId/lessons/:lessonId` — Delete lesson

### Procedures (`/api/v1/courses/:courseId/procedures`)
- `GET /api/v1/courses/:courseId/procedures` — List step-by-step procedures
- `POST /api/v1/courses/:courseId/procedures` — Add procedure step `{ "stepNumber": 1, "title": "Step 1", "instructions": "..." }`
- `PUT /api/v1/courses/:courseId/procedures/:procedureId` — Update procedure step
- `DELETE /api/v1/courses/:courseId/procedures/:procedureId` — Delete procedure step

### Resources (`/api/v1/courses/:courseId/resources`)
- `GET /api/v1/courses/:courseId/resources` — List downloadable files
- `POST /api/v1/courses/:courseId/resources` — Add resource `{ "title": "Formula Card", "fileUrl": "...", "fileType": "PDF" }`
- `PUT /api/v1/courses/:courseId/resources/:resourceId` — Update resource
- `DELETE /api/v1/courses/:courseId/resources/:resourceId` — Delete resource

### Business Guidance (`/api/v1/courses/:courseId/guidance`)
- `GET /api/v1/courses/:courseId/guidance` — List business guidance topics
- `POST /api/v1/courses/:courseId/guidance` — Add guidance `{ "title": "Pricing Strategy", "content": "..." }`
- `PUT /api/v1/courses/:courseId/guidance/:guidanceId` — Update guidance
- `DELETE /api/v1/courses/:courseId/guidance/:guidanceId` — Delete guidance

---

## 6. 🚨 Standard Error Format

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```
