# 🌟 Course Reviews & Ratings API Documentation

Comprehensive API integration guide for frontend developers building student reviews, course rating statistics, review submission forms, and admin moderation panels on **Lemon Academia**.

---

## 🌐 Base URL
* **Production**: `https://api.lemonhousecraft.in/api/v1`
* **Local Development**: `http://localhost:5000/api/v1`

---

## 🔐 Authentication & Authorization Rules

| Role | Permissions |
| :--- | :--- |
| **Public / Any User** | View published reviews and rating statistics for any course |
| **Enrolled Student (`STUDENT`)** | Submit 1 review per enrolled course, fetch own review, edit/delete own review |
| **Admin (`ADMIN`)** | View all reviews (including unpublished), search & filter, edit/delete any review, publish/unpublish reviews |

> [!NOTE]
> Authenticated requests must include the Bearer token in the header:
> `Authorization: Bearer <your_access_token>`

---

## 📑 Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/courses/:courseId/reviews` | Public | Get reviews, average rating & 5-star breakdown for a course |
| `POST` | `/courses/:courseId/reviews` | Enrolled Student | Submit a rating (1-5) and review comment |
| `GET` | `/courses/:courseId/reviews/my-review` | Enrolled Student | Check if current student already reviewed this course |
| `PATCH` | `/reviews/:id` | Review Author / Admin | Update rating or comment |
| `DELETE` | `/reviews/:id` | Review Author / Admin | Delete review |
| `GET` | `/reviews` | Admin Only | Get all reviews with filters (`courseId`, `rating`, `search`, `isPublished`) |
| `PATCH` | `/reviews/:id/publish` | Admin Only | Publish or unpublish a review |

---

## 1. Get Course Reviews & Rating Stats (Public)

Fetches all published reviews for a course along with rating metrics (average rating, total count, and 1-5 star distribution).

* **Method**: `GET`
* **Endpoint**: `/courses/:courseId/reviews`
* **Auth**: Not Required

### Query Parameters
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page (max 50) |
| `rating` | `number` | *optional* | Filter by star rating (`1`, `2`, `3`, `4`, or `5`) |

### Example Request
```http
GET /api/v1/courses/60824b61-da28-4eb1-b3b4-ab98e0ae7138/reviews?page=1&limit=10
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Course reviews fetched successfully",
  "data": {
    "course": {
      "id": "60824b61-da28-4eb1-b3b4-ab98e0ae7138",
      "title": "Mastering Lippan Art & Mud Mirror Craft",
      "slug": "mastering-lippan-art-mud-mirror-craft"
    },
    "stats": {
      "totalReviews": 48,
      "averageRating": 4.85,
      "breakdown": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 10,
        "5": 35
      }
    },
    "reviews": [
      {
        "id": "c76a911e-b815-46f3-a4e9-9faeb68097bb",
        "rating": 5,
        "comment": "Outstanding course! The clay consistency tips and mirror layout strategies were game changers.",
        "isPublished": true,
        "createdAt": "2026-09-08T10:15:30.000Z",
        "updatedAt": "2026-09-08T10:15:30.000Z",
        "student": {
          "id": "a90435b8-cd12-4f32-8499-108ec92ba14a",
          "name": "Ananya Sharma",
          "email": "ananya@example.com",
          "studentProfile": {
            "name": "Ananya Sharma",
            "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          }
        }
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## 2. Submit a Review (Enrolled Student)

Allows an actively enrolled student to submit a rating and comment.

* **Method**: `POST`
* **Endpoint**: `/courses/:courseId/reviews`
* **Auth**: Required (`STUDENT`)

### Request Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "rating": 5,
  "comment": "Clear instructions, easy to follow, and the instructor answered all my queries quickly!"
}
```

| Field | Type | Required | Validation | Description |
| :--- | :--- | :---: | :--- | :--- |
| `rating` | `integer` | **Yes** | `1` to `5` | Integer star rating |
| `comment` | `string` | No | Optional text | Written feedback / review text |

### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "c76a911e-b815-46f3-a4e9-9faeb68097bb",
    "studentId": "a90435b8-cd12-4f32-8499-108ec92ba14a",
    "courseId": "60824b61-da28-4eb1-b3b4-ab98e0ae7138",
    "rating": 5,
    "comment": "Clear instructions, easy to follow, and the instructor answered all my queries quickly!",
    "isPublished": true,
    "createdAt": "2026-09-09T08:30:00.000Z",
    "updatedAt": "2026-09-09T08:30:00.000Z",
    "student": {
      "id": "a90435b8-cd12-4f32-8499-108ec92ba14a",
      "name": "Ananya Sharma",
      "email": "ananya@example.com",
      "studentProfile": {
        "name": "Ananya Sharma",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
      }
    },
    "course": {
      "id": "60824b61-da28-4eb1-b3b4-ab98e0ae7138",
      "title": "Mastering Lippan Art & Mud Mirror Craft",
      "slug": "mastering-lippan-art-mud-mirror-craft"
    }
  }
}
```

### Error Responses
* `400 Bad Request`: User already submitted a review (`"You have already reviewed this course"`).
* `403 Forbidden`: User is not enrolled (`"You must be enrolled in this course to leave a review"`).

---

## 3. Get Logged-in Student's Review

Checks if the currently logged-in student has already reviewed this course (useful to toggle between "Write a Review" and "Edit Review" button in UI).

* **Method**: `GET`
* **Endpoint**: `/courses/:courseId/reviews/my-review`
* **Auth**: Required (`STUDENT`)

### Success Response (`200 OK`)
* **When Reviewed**: Returns the review object in `data`.
* **When Not Reviewed Yet**: Returns `"data": null`.

```json
{
  "success": true,
  "message": "Student review fetched successfully",
  "data": {
    "id": "c76a911e-b815-46f3-a4e9-9faeb68097bb",
    "rating": 5,
    "comment": "Clear instructions and great kit!",
    "createdAt": "2026-09-09T08:30:00.000Z"
  }
}
```

---

## 4. Update a Review

Allows a student to edit their rating or comment, or an Admin to modify.

* **Method**: `PATCH`
* **Endpoint**: `/reviews/:id`
* **Auth**: Required (`STUDENT` author or `ADMIN`)

### Request Body
```json
{
  "rating": 4,
  "comment": "Updated my thoughts after finishing all modules. Really good practical course!"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "c76a911e-b815-46f3-a4e9-9faeb68097bb",
    "rating": 4,
    "comment": "Updated my thoughts after finishing all modules. Really good practical course!",
    "updatedAt": "2026-09-09T08:45:00.000Z"
  }
}
```

---

## 5. Delete a Review

* **Method**: `DELETE`
* **Endpoint**: `/reviews/:id`
* **Auth**: Required (`STUDENT` author or `ADMIN`)

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "id": "c76a911e-b815-46f3-a4e9-9faeb68097bb"
  }
}
```

---

## 6. Admin: Manage & Moderate All Reviews

* **Method**: `GET`
* **Endpoint**: `/reviews`
* **Auth**: Required (`ADMIN`)

### Query Parameters
| Param | Type | Description |
| :--- | :--- | :--- |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (default: 20) |
| `courseId` | `string` | Filter by Course ID |
| `rating` | `number` | Filter by exact star rating (`1-5`) |
| `isPublished` | `boolean` | Filter by status (`true` / `false`) |
| `search` | `string` | Search within comments, student name, or course title |

### Publish / Unpublish a Review (Admin)
* **Method**: `PATCH`
* **Endpoint**: `/reviews/:id/publish`
* **Request Body**:
```json
{
  "isPublished": false
}
```

---

## 💻 TypeScript Definitions (For Frontend)

```typescript
export interface ReviewStudentProfile {
  name: string;
  avatarUrl?: string | null;
}

export interface ReviewStudent {
  id: string;
  name: string;
  email: string;
  studentProfile?: ReviewStudentProfile | null;
}

export interface CourseReview {
  id: string;
  rating: number;
  comment?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  student: ReviewStudent;
}

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  breakdown: RatingBreakdown;
}

export interface CourseReviewsResponse {
  success: boolean;
  message: string;
  data: {
    course: {
      id: string;
      title: string;
      slug: string;
    };
    stats: ReviewStats;
    reviews: CourseReview[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
```

---

## ⚛️ React Component Example (Rating Breakdown & Review List)

```tsx
import React, { useState, useEffect } from "react";

export function CourseReviewsSection({ courseId, token }: { courseId: string; token?: string }) {
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // 1. Fetch course reviews & stats
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      const url = new URL(`https://api.lemonhousecraft.in/api/v1/courses/${courseId}/reviews`);
      if (filterRating) url.searchParams.append("rating", filterRating.toString());

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) setReviewsData(json.data);
      setLoading(false);
    }

    fetchReviews();
  }, [courseId, filterRating]);

  // 2. Fetch logged-in student's review
  useEffect(() => {
    if (!token) return;
    fetch(`https://api.lemonhousecraft.in/api/v1/courses/${courseId}/reviews/my-review`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMyReview(json.data);
      });
  }, [courseId, token]);

  if (loading && !reviewsData) return <div>Loading reviews...</div>;

  const { stats, reviews } = reviewsData || {};

  return (
    <div className="course-reviews-container my-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Student Ratings & Reviews</h2>

      {/* Stats & Score Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b">
        <div className="text-center md:text-left">
          <div className="text-5xl font-extrabold text-amber-500">
            {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          </div>
          <div className="flex justify-center md:justify-start text-amber-400 text-lg my-1">
            {"★".repeat(Math.round(stats?.averageRating || 0))}
            {"☆".repeat(5 - Math.round(stats?.averageRating || 0))}
          </div>
          <p className="text-sm text-gray-500">Based on {stats?.totalReviews || 0} reviews</p>
        </div>

        {/* 1-5 Star Breakdown Bars */}
        <div className="flex-1 w-full max-w-md space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats?.breakdown[stars] || 0;
            const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div
                key={stars}
                onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                className={`flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 ${
                  filterRating === stars ? "font-bold text-amber-600" : "text-gray-600"
                }`}
              >
                <span className="w-12">{stars} Stars</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews?.map((r: any) => (
          <div key={r.id} className="review-card p-4 border rounded-xl bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={r.student?.studentProfile?.avatarUrl || "/default-avatar.png"}
                  alt={r.student?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{r.student?.name}</h4>
                  <div className="text-amber-400 text-xs">{"★".repeat(r.rating)}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            {r.comment && <p className="text-gray-700 text-sm mt-2">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```
