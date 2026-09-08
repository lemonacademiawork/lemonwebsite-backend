# 🎟️ Coupon & 👨‍🏫 Trainer Applications — REST API Documentation

Comprehensive API reference and integration guide for the **Coupon Discount System** and **"Become a Trainer" Application Workflow** in Lemon Academia.

- **Base URL (Production)**: `https://lemonwebsite-backend.onrender.com/api/v1`
- **Base URL (Local)**: `http://localhost:5000/api/v1`
- **Interactive Swagger UI**: `http://localhost:5000/api-docs`

---

## 🔐 Authentication & Roles

Endpoints marked as **Protected** require a JWT Bearer token in the request header:
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

| Role | Permissions |
|---|---|
| `PUBLIC` / `STUDENT` | Validate coupons, view public promotions, submit trainer applications, view personal applications |
| `ADMIN` | Create, update, delete coupons; review, approve, reject trainer applications |

---

## Table of Contents

1. [🎟️ Coupon API (`/coupons`)](#1-coupon-api-apiv1coupons)
   - [1.1 Validate / Apply Coupon](#11-validate--apply-coupon)
   - [1.2 Get Active Public Coupons](#12-get-active-public-coupons)
   - [1.3 Admin: Create Coupon](#13-admin-create-coupon)
   - [1.4 Admin: List All Coupons](#14-admin-list-all-coupons)
   - [1.5 Admin: Get Coupon by ID](#15-admin-get-coupon-by-id)
   - [1.6 Admin: Update Coupon](#16-admin-update-coupon)
   - [1.7 Admin: Delete Coupon](#17-admin-delete-coupon)
2. [👨‍🏫 Trainer Applications API (`/trainer-requests`)](#2-trainer-applications-api-apiv1trainer-requests)
   - [2.1 Submit "Become a Trainer" Application](#21-submit-become-a-trainer-application)
   - [2.2 Get My Submitted Applications](#22-get-my-submitted-applications)
   - [2.3 Admin: List All Applications](#23-admin-list-all-applications)
   - [2.4 Admin: Get Application Details by ID](#24-admin-get-application-details-by-id)
   - [2.5 Admin: Review (Approve / Reject) Application](#25-admin-review-approve--reject-application)
   - [2.6 Admin: Delete Application](#26-admin-delete-application)

---

# 1. Coupon API (`/api/v1/coupons`)

### 1.1 Validate / Apply Coupon
Validates a coupon code against a purchase amount and course. Computes the discount based on coupon rules (min order, max cap, percentage vs flat, expiry, usage limits).

- **Method**: `POST`
- **Path**: `/api/v1/coupons/validate`
- **Auth**: Public / Optional Student Bearer Token

#### Request Body
```json
{
  "code": "LEMON20",
  "amount": 2999,
  "courseId": "c1f7a08b-9e23-4567-8901-abcdef123456"
}
```

#### Request Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `code` | string | **Yes** | Coupon promo code (case-insensitive) |
| `amount` | number | **Yes** | Original course / cart price in INR |
| `courseId` | string (UUID) | No | Course ID (needed if coupon is course-specific) |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "valid": true,
    "coupon": {
      "id": "7b8e910a-3c4d-4e5f-8901-123456789abc",
      "code": "LEMON20",
      "description": "20% off all craft masterclasses",
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

#### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Minimum order amount for this coupon is ₹999"
}
```
*Other error messages: `"Invalid coupon code"`, `"This coupon has expired"`, `"This coupon has reached its maximum total usage limit"`, `"This coupon is only applicable to course: Mastering Modern Crochet"`.*

---

### 1.2 Get Active Public Coupons
Retrieves promotional coupons that are currently active and unexpired for frontend promotion banners or checkout suggestions.

- **Method**: `GET`
- **Path**: `/api/v1/coupons/public`
- **Auth**: Public

#### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `courseId` | string | No | Filter coupons applicable to a specific course |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Active promotional coupons retrieved successfully",
  "data": [
    {
      "id": "7b8e910a-3c4d-4e5f-8901-123456789abc",
      "code": "LEMON20",
      "description": "20% off all courses",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minOrderAmount": 999,
      "maxDiscountAmount": 1000,
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "course": null
    }
  ]
}
```

---

### 1.3 Admin: Create Coupon
Creates a new discount coupon with custom restrictions.

- **Method**: `POST`
- **Path**: `/api/v1/coupons`
- **Auth**: Required (`ADMIN` role)

#### Request Body
```json
{
  "code": "SUMMER50",
  "description": "50% discount for summer campaign",
  "discountType": "PERCENTAGE",
  "discountValue": 50,
  "minOrderAmount": 1499,
  "maxDiscountAmount": 1000,
  "startDate": "2026-06-01T00:00:00.000Z",
  "expiryDate": "2026-08-31T23:59:59.000Z",
  "usageLimit": 200,
  "perUserLimit": 1,
  "courseId": null,
  "isActive": true
}
```

#### Request Fields
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `code` | string | **Yes** | — | Unique coupon code (e.g., `SUMMER50`) |
| `discountType` | string | No | `PERCENTAGE` | `PERCENTAGE` or `FLAT` |
| `discountValue` | number | **Yes** | — | Percentage (e.g. `20`) or Flat amount in INR (e.g. `500`) |
| `description` | string | No | null | Description of the offer |
| `minOrderAmount` | number | No | `0` | Minimum purchase required |
| `maxDiscountAmount` | number | No | null | Cap on percentage discounts (in INR) |
| `startDate` | ISO Date | No | Now | When the coupon becomes valid |
| `expiryDate` | ISO Date | No | null | When the coupon expires |
| `usageLimit` | integer | No | null | Maximum total platform redemptions |
| `perUserLimit` | integer | No | `1` | Maximum redemptions per user account |
| `courseId` | UUID | No | null | Lock to a specific course (null = site-wide) |
| `isActive` | boolean | No | `true` | Enable or disable coupon |

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": "8c9d012a-4b5c-6d7e-8901-abcdef123456",
    "code": "SUMMER50",
    "description": "50% discount for summer campaign",
    "discountType": "PERCENTAGE",
    "discountValue": 50,
    "minOrderAmount": 1499,
    "maxDiscountAmount": 1000,
    "startDate": "2026-06-01T00:00:00.000Z",
    "expiryDate": "2026-08-31T23:59:59.000Z",
    "usageLimit": 200,
    "usageCount": 0,
    "perUserLimit": 1,
    "courseId": null,
    "isActive": true,
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z"
  }
}
```

---

### 1.4 Admin: List All Coupons
List all coupons with pagination, search, and active state filters.

- **Method**: `GET`
- **Path**: `/api/v1/coupons`
- **Auth**: Required (`ADMIN` role)

#### Query Parameters
| Parameter | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Search code or description |
| `isActive` | boolean | — | Filter by active state (`true` / `false`) |
| `courseId` | string | — | Filter by applicable course |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Coupons retrieved successfully",
  "data": [
    {
      "id": "8c9d012a-4b5c-6d7e-8901-abcdef123456",
      "code": "SUMMER50",
      "discountType": "PERCENTAGE",
      "discountValue": 50,
      "usageCount": 12,
      "usageLimit": 200,
      "isActive": true,
      "_count": { "usages": 12 }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 1.5 Admin: Get Coupon by ID
- **Method**: `GET`
- **Path**: `/api/v1/coupons/:id`
- **Auth**: Required (`ADMIN` role)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Coupon details retrieved successfully",
  "data": {
    "id": "8c9d012a-4b5c-6d7e-8901-abcdef123456",
    "code": "SUMMER50",
    "usages": [
      {
        "id": "u1a2b3c4-...",
        "userId": "usr-123",
        "discountAmount": 500,
        "usedAt": "2026-03-01T11:00:00.000Z",
        "user": {
          "id": "usr-123",
          "name": "Sejal Agarwal",
          "phone": "9876543210",
          "email": "sejal@example.com"
        }
      }
    ]
  }
}
```

---

### 1.6 Admin: Update Coupon
- **Method**: `PATCH`
- **Path**: `/api/v1/coupons/:id`
- **Auth**: Required (`ADMIN` role)

#### Request Body
```json
{
  "discountValue": 30,
  "usageLimit": 500,
  "isActive": false
}
```

---

### 1.7 Admin: Delete Coupon
- **Method**: `DELETE`
- **Path**: `/api/v1/coupons/:id`
- **Auth**: Required (`ADMIN` role)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

# 2. Trainer Applications API (`/api/v1/trainer-requests`)

### 2.1 Submit "Become a Trainer" Application
Allows aspiring artisans and teachers to apply to become an instructor on Lemon Academia. Can be called by unauthenticated guests or logged-in students.

- **Method**: `POST`
- **Path**: `/api/v1/trainer-requests`
- **Auth**: Public / Optional Bearer Token

#### Request Body
```json
{
  "name": "Priya Sharma",
  "phone": "9876543210",
  "email": "priya@example.com",
  "expertise": "Modern Crochet & Amigurumi",
  "experienceYears": 6,
  "bio": "Certified fiber artist with 6 years of experience running craft workshops and selling handmade items.",
  "portfolioUrl": "https://instagram.com/crochet_priya",
  "sampleVideoUrl": "https://youtube.com/watch?v=sample123",
  "resumeUrl": "https://drive.google.com/file/d/sample"
}
```

#### Request Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | **Yes** | Full name of applicant |
| `phone` | string | **Yes** | Primary phone number (must be valid) |
| `expertise` | string | **Yes** | Craft / domain expertise (e.g. Baking, Soap Making, Crochet) |
| `email` | string | No | Contact email address |
| `experienceYears` | integer | No | Years of teaching / crafting experience |
| `bio` | string | No | Short bio and introduction |
| `portfolioUrl` | string (URL) | No | Link to portfolio, Instagram, or craft shop |
| `sampleVideoUrl` | string (URL) | No | Link to video lesson sample or tutorial |
| `resumeUrl` | string (URL) | No | Resume / credentials document link |

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
    "bio": "Certified fiber artist with 6 years of experience running craft workshops and selling handmade items.",
    "portfolioUrl": "https://instagram.com/crochet_priya",
    "sampleVideoUrl": "https://youtube.com/watch?v=sample123",
    "resumeUrl": "https://drive.google.com/file/d/sample",
    "status": "PENDING",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### 2.2 Get My Submitted Applications
Allows logged-in users to track the status of their trainer applications.

- **Method**: `GET`
- **Path**: `/api/v1/trainer-requests/me`
- **Auth**: Required (`Bearer <accessToken>`)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Trainer applications retrieved successfully",
  "data": [
    {
      "id": "tr1f7a08b-9e23-4567-8901-abcdef123456",
      "expertise": "Modern Crochet & Amigurumi",
      "status": "PENDING",
      "adminNotes": null,
      "createdAt": "2026-03-01T12:00:00.000Z"
    }
  ]
}
```

---

### 2.3 Admin: List All Applications
List all trainer applications with filtering by status and search queries.

- **Method**: `GET`
- **Path**: `/api/v1/trainer-requests`
- **Auth**: Required (`ADMIN` role)

#### Query Parameters
| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter by `PENDING`, `APPROVED`, or `REJECTED` |
| `search` | string | — | Search by applicant name, phone, email, or expertise |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Trainer applications retrieved successfully",
  "data": [
    {
      "id": "tr1f7a08b-9e23-4567-8901-abcdef123456",
      "name": "Priya Sharma",
      "phone": "9876543210",
      "email": "priya@example.com",
      "expertise": "Modern Crochet & Amigurumi",
      "experienceYears": 6,
      "status": "PENDING",
      "createdAt": "2026-03-01T12:00:00.000Z",
      "user": {
        "id": "usr-123",
        "name": "Priya Sharma",
        "role": "STUDENT"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2.4 Admin: Get Application Details by ID
- **Method**: `GET`
- **Path**: `/api/v1/trainer-requests/:id`
- **Auth**: Required (`ADMIN` role)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Trainer application details retrieved successfully",
  "data": {
    "id": "tr1f7a08b-9e23-4567-8901-abcdef123456",
    "name": "Priya Sharma",
    "phone": "9876543210",
    "email": "priya@example.com",
    "expertise": "Modern Crochet & Amigurumi",
    "experienceYears": 6,
    "bio": "Certified fiber artist with 6 years of experience.",
    "portfolioUrl": "https://instagram.com/crochet_priya",
    "sampleVideoUrl": "https://youtube.com/watch?v=sample123",
    "resumeUrl": "https://drive.google.com/file/d/sample",
    "status": "PENDING",
    "adminNotes": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "user": {
      "id": "usr-123",
      "name": "Priya Sharma",
      "role": "STUDENT",
      "studentProfile": { "phone": "9876543210" }
    }
  }
}
```

---

### 2.5 Admin: Review (Approve / Reject) Application
Admin approves or rejects the application. 
> [!IMPORTANT]
> When `status` is set to **`APPROVED`**, the applicant's account role is **automatically updated to `TRAINER`** and a default `TrainerProfile` is provisioned for them.

- **Method**: `PATCH`
- **Path**: `/api/v1/trainer-requests/:id/status`
- **Auth**: Required (`ADMIN` role)

#### Request Body
```json
{
  "status": "APPROVED",
  "adminNotes": "Sample video was great. Instructor onboarding email sent."
}
```

#### Request Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | **Yes** | `APPROVED` or `REJECTED` |
| `adminNotes` | string | No | Internal notes or feedback for candidate |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Trainer application status updated to APPROVED",
  "data": {
    "id": "tr1f7a08b-9e23-4567-8901-abcdef123456",
    "status": "APPROVED",
    "adminNotes": "Sample video was great. Instructor onboarding email sent.",
    "reviewedAt": "2026-03-01T15:30:00.000Z",
    "user": {
      "id": "usr-123",
      "name": "Priya Sharma",
      "phone": "9876543210",
      "role": "TRAINER"
    },
    "reviewer": {
      "id": "admin-123",
      "name": "Lemon Academy Admin",
      "email": "admin@lemonacademy.com"
    }
  }
}
```

---

### 2.6 Admin: Delete Application
- **Method**: `DELETE`
- **Path**: `/api/v1/trainer-requests/:id`
- **Auth**: Required (`ADMIN` role)

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Trainer application request deleted successfully"
}
```
