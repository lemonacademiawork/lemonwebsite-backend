# Homepage Hero Carousel & Dynamic Settings API Documentation

This document contains complete API specifications for the **Homepage Hero Carousel** and **System Settings** endpoints, including Public and Admin routes, sample payloads, error states, and frontend integration examples.

---

## Base URLs
- **Production**: `https://api.lemonhousecraft.in/api/v1`
- **Development**: `http://localhost:5000/api/v1`

---

## 1. Public Carousel Endpoints

### 1.1 Fetch Active Carousel Slides
Returns all active creative banner slides for the homepage hero carousel, ordered by display sequence (`order ASC`).

- **Method**: `GET`
- **Endpoints** *(Both are supported)*:
  - `/api/v1/content/carousel`
  - `/api/v1/carousel`
- **Authentication**: **Public** (No Bearer token required)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "2195f190-c116-43b9-a4eb-5e045ab5dce2",
      "title": "Learn. Create. Inspire.",
      "tagline": "Master the art of Lippan Mirror Work",
      "description": "Explore mirror & clay magic in our modern studio classes.",
      "imageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      "route": "/courses",
      "category": "lippan-art",
      "order": 1,
      "active": true,
      "isActive": true,
      "createdAt": "2026-09-09T08:15:20.000Z",
      "updatedAt": "2026-09-09T08:15:20.000Z"
    },
    {
      "id": "e8d7a12b-34ef-4567-89ab-cdef01234567",
      "title": "Crafted with Warmth & Aroma",
      "tagline": "Artisan Soy Candle Making Masterclass",
      "description": "Hand-pour scented botanical candles with pure essential oils.",
      "imageUrl": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200&q=80",
      "route": "/courses",
      "category": "candle-making",
      "order": 2,
      "active": true,
      "isActive": true,
      "createdAt": "2026-09-09T08:15:20.000Z",
      "updatedAt": "2026-09-09T08:15:20.000Z"
    }
  ]
}
```

---

### 1.2 Fetch Public Dynamic Settings
Fetches general public configuration parameters stored in the database.

- **Method**: `GET`
- **Endpoint**: `/api/v1/settings/public?key=homepage_carousel`
- **Authentication**: **Public** (No Bearer token required)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "settingKey": "homepage_carousel",
  "description": "Homepage Hero Carousel Slides",
  "data": [
    {
      "id": "1",
      "title": "Learn. Create. Inspire.",
      "tagline": "Master the art of Lippan Mirror Work",
      "description": "Explore mirror & clay magic.",
      "imageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      "route": "/courses",
      "category": "lippan-art",
      "active": true
    }
  ]
}
```

---

## 2. Admin Carousel Management Endpoints

All admin endpoints require an Authorization Header:
```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### 2.1 List All Slides (Admin)
Returns all active and inactive carousel slides.
- **Method**: `GET`
- **Endpoint**: `/api/v1/admin/carousel`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "2195f190-c116-43b9-a4eb-5e045ab5dce2",
      "title": "Learn. Create. Inspire.",
      "tagline": "Master the art of Lippan Mirror Work",
      "description": "Explore mirror & clay magic.",
      "imageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      "route": "/courses",
      "category": "lippan-art",
      "order": 1,
      "active": true,
      "isActive": true
    }
  ]
}
```

---

### 2.2 Create Carousel Slide
- **Method**: `POST`
- **Endpoint**: `/api/v1/admin/carousel`

#### Request Body:
```json
{
  "title": "New Pottery Workshop",
  "tagline": "Shape Earth into Timeless Art",
  "description": "Sculpt organic planters, mugs, and vases.",
  "imageUrl": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
  "route": "/courses/pottery",
  "category": "pottery",
  "order": 3,
  "isActive": true
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Carousel slide created successfully",
  "data": {
    "id": "5f3a71b2-1089-4bc2-841f-abcde1234567",
    "title": "New Pottery Workshop",
    "tagline": "Shape Earth into Timeless Art",
    "description": "Sculpt organic planters, mugs, and vases.",
    "imageUrl": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
    "route": "/courses/pottery",
    "category": "pottery",
    "order": 3,
    "isActive": true
  }
}
```

---

### 2.3 Update Carousel Slide
- **Method**: `PATCH`
- **Endpoint**: `/api/v1/admin/carousel/:id`

#### Request Body (Any field can be updated):
```json
{
  "title": "Updated Masterclass Title",
  "isActive": false,
  "order": 5
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Carousel slide updated successfully",
  "data": {
    "id": "5f3a71b2-1089-4bc2-841f-abcde1234567",
    "title": "Updated Masterclass Title",
    "isActive": false,
    "order": 5
  }
}
```

---

### 2.4 Delete Carousel Slide
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/admin/carousel/:id`

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Slide deleted successfully"
}
```

---

### 2.5 Bulk Reorder Slides
- **Method**: `PUT`
- **Endpoint**: `/api/v1/admin/carousel/reorder`

#### Request Body:
```json
{
  "slides": [
    { "id": "slide_id_1", "order": 1 },
    { "id": "slide_id_2", "order": 2 },
    { "id": "slide_id_3", "order": 3 }
  ]
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

---

### 2.6 Save Raw System Setting (Admin)
- **Method**: `PUT`
- **Endpoints**: `/api/v1/admin/settings` OR `/api/v1/settings`
- **Auth**: `Bearer <ADMIN_TOKEN>`

#### Request Body:
```json
{
  "settingKey": "homepage_carousel",
  "settingValue": "[{\"id\":\"1\",\"title\":\"Learn. Create. Inspire.\",\"imageUrl\":\"https://res.cloudinary.com/.../img.jpg\",\"route\":\"/courses\",\"active\":true}]",
  "description": "Homepage Hero Carousel Slides"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "System setting saved successfully",
  "data": {
    "id": "setting-uuid",
    "settingKey": "homepage_carousel",
    "settingValue": "[{\"id\":\"1\",...}]",
    "description": "Homepage Hero Carousel Slides"
  }
}
```

---

## 3. Frontend Integration Code Examples

### 3.1 React / Next.js Custom Hook
```typescript
import { useState, useEffect } from "react";
import axios from "axios";

export interface CarouselSlide {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  imageUrl: string;
  route?: string;
  category?: string;
  order: number;
  active: boolean;
  isActive: boolean;
}

export const useHeroCarousel = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/content/carousel`
        );
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setSlides(res.data.data);
        }
      } catch (err: any) {
        console.error("Hero carousel fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch carousel");
      } finally {
        setLoading(false);
      }
    };

    fetchCarousel();
  }, []);

  return { slides, loading, error };
};
```

---

### 3.2 Slide Component Rendering with Image
```tsx
import React from "react";
import { useHeroCarousel } from "@/hooks/useHeroCarousel";

export const HeroSection = () => {
  const { slides, loading, error } = useHeroCarousel();

  if (loading) {
    return <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-2xl" />;
  }

  if (error || !slides.length) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden rounded-3xl">
      {slides.map((slide, idx) => (
        <div key={slide.id} className="relative w-full h-[520px]">
          {/* Banner Image */}
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
            loading={idx === 0 ? "eager" : "lazy"}
          />

          {/* Dark Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
            {slide.category && (
              <span className="text-amber-400 font-semibold tracking-wider text-xs uppercase mb-2">
                {slide.category}
              </span>
            )}
            {slide.tagline && (
              <p className="text-amber-200 text-sm md:text-lg font-medium mb-1">
                {slide.tagline}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl font-bold max-w-xl mb-4 leading-tight">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="text-gray-300 text-sm md:text-base max-w-lg mb-6 line-clamp-3">
                {slide.description}
              </p>
            )}
            <div>
              <a
                href={slide.route || "/courses"}
                className="inline-block bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold px-7 py-3 rounded-full transition shadow-lg"
              >
                Explore Courses
              </a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
```
