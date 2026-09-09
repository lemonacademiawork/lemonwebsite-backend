# 🎨 Creative Content — Homepage Hero Carousel & Banner Slides API

Complete API reference and integration guide for the **Homepage Hero Carousel & Banner Slides** in Lemon Academia.

---

## 1. 🌐 API Overview & Environments

| Environment | Base URL |
| :--- | :--- |
| **Production API** | `https://api.lemonhousecraft.in/api/v1` |
| **Local API** | `http://localhost:5000/api/v1` |
| **Swagger UI** | `https://api.lemonhousecraft.in/api-docs` |

---

## 2. 🗄️ Database Model (`CarouselSlide`)

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Yes | Auto UUID | Unique identifier |
| `title` | String | Yes | — | Main headline (e.g. "Learn. Create. Inspire.") |
| `tagline` | String | No | null | Category badge/subheading (e.g. "Master the art of Lippan Mirror Work") |
| `description` | String (Text) | No | null | Brief promotional description |
| `imageUrl` | String (URL) | Yes | — | Cloudinary / CDN hosted image URL |
| `route` | String | No | `"/courses"` | Target frontend navigation route |
| `category` | String | No | null | Optional category slug (e.g. `"lippan-art"`, `"candle-making"`) |
| `order` | Integer | Yes | `0` | Sequence sorting index (Ascending) |
| `isActive` | Boolean | Yes | `true` | Visibility state on homepage |
| `createdAt` | DateTime | Yes | Auto | Timestamp created |
| `updatedAt` | DateTime | Yes | Auto | Timestamp updated |

---

## 3. 🚀 Endpoints Summary

| Endpoint | Method | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/carousel` | `GET` | Public | Fetch active carousel slides ordered by `order ASC` |
| `/api/v1/content/carousel` | `GET` | Public | Alias endpoint for public carousel slides |
| `/api/v1/admin/carousel` | `GET` | Admin (`Bearer`) | Fetch all slides (active and inactive) |
| `/api/v1/admin/carousel/:id` | `GET` | Admin (`Bearer`) | Get single slide details |
| `/api/v1/admin/carousel` | `POST` | Admin (`Bearer`) | Create new hero banner slide |
| `/api/v1/admin/carousel/:id` | `PATCH` | Admin (`Bearer`) | Update slide metadata, image URL, or toggle `isActive` |
| `/api/v1/admin/carousel/:id` | `DELETE` | Admin (`Bearer`) | Delete a carousel slide |
| `/api/v1/admin/carousel/reorder` | `PUT` | Admin (`Bearer`) | Bulk update slide order sequence |
| `/api/v1/upload/image` | `POST` | Authenticated | Upload banner image (`multipart/form-data`) |

---

## 4. 📖 Detailed API Specification

### A. Public Endpoints

#### 4.1 Get Active Carousel Slides
- **Method**: `GET`
- **Path**: `/api/v1/carousel` *(or `/api/v1/content/carousel`)*
- **Auth**: Public

##### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "f51952e4-9d54-4a2e-a58e-0f11c750e32b",
      "title": "Learn. Create. Inspire.",
      "tagline": "Master the art of Lippan Mirror Work",
      "description": "Explore mirror & clay magic in our modern studio classes.",
      "imageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
      "route": "/courses",
      "category": "lippan-art",
      "order": 1,
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    },
    {
      "id": "a2432cfb-b516-4357-817e-c80f681a2f64",
      "title": "Crafted with Warmth & Aroma",
      "tagline": "Artisan Soy Candle Making Masterclass",
      "description": "Hand-pour scented botanical candles with pure essential oils.",
      "imageUrl": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200&q=80",
      "route": "/courses",
      "category": "candle-making",
      "order": 2,
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

---

### B. Admin Management Endpoints

All admin endpoints require an `Authorization: Bearer <ADMIN_JWT_TOKEN>` header.

#### 4.2 List All Slides (Admin)
- **Method**: `GET`
- **Path**: `/api/v1/admin/carousel`
- **Auth**: Admin

##### Response (`200 OK`)
Returns array of all slides (both active and inactive).

---

#### 4.3 Create a Hero Banner Slide
- **Method**: `POST`
- **Path**: `/api/v1/admin/carousel`
- **Auth**: Admin

##### Request Body (`application/json`)
```json
{
  "title": "Knit. Weave. Express.",
  "tagline": "Artisan Crochet & Fiber Crafts",
  "description": "Master intricate stitch patterns with step-by-step guidance.",
  "imageUrl": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1200&q=80",
  "route": "/courses",
  "category": "crochet-basics",
  "order": 6,
  "isActive": true
}
```

##### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Carousel slide created successfully",
  "data": {
    "id": "33b66d48-8df0-4b2e-a579-813c9e6e4a29",
    "title": "Knit. Weave. Express.",
    "tagline": "Artisan Crochet & Fiber Crafts",
    "description": "Master intricate stitch patterns with step-by-step guidance.",
    "imageUrl": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1200&q=80",
    "route": "/courses",
    "category": "crochet-basics",
    "order": 6,
    "isActive": true,
    "createdAt": "2026-03-09T10:00:00.000Z",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

#### 4.4 Update Slide Metadata / Toggle Visibility
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/carousel/:id`
- **Auth**: Admin

##### Request Body (`application/json`)
```json
{
  "title": "Updated Headline Title",
  "imageUrl": "https://res.cloudinary.com/.../new-banner.webp",
  "isActive": false
}
```

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Carousel slide updated successfully",
  "data": {
    "id": "33b66d48-8df0-4b2e-a579-813c9e6e4a29",
    "title": "Updated Headline Title",
    "imageUrl": "https://res.cloudinary.com/.../new-banner.webp",
    "isActive": false
  }
}
```

---

#### 4.5 Bulk Reorder Slides
- **Method**: `PUT`
- **Path**: `/api/v1/admin/carousel/reorder`
- **Auth**: Admin

##### Request Body (`application/json`)
```json
{
  "slides": [
    { "id": "33b66d48-8df0-4b2e-a579-813c9e6e4a29", "order": 1 },
    { "id": "f51952e4-9d54-4a2e-a58e-0f11c750e32b", "order": 2 }
  ]
}
```

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": [
    { "id": "33b66d48-8df0-4b2e-a579-813c9e6e4a29", "order": 1 },
    { "id": "f51952e4-9d54-4a2e-a58e-0f11c750e32b", "order": 2 }
  ]
}
```

---

#### 4.6 Delete a Slide
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/carousel/:id`
- **Auth**: Admin

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Slide deleted successfully"
}
```

---

### C. Media Upload Endpoint

#### 4.7 Upload Image for Banner
- **Method**: `POST`
- **Path**: `/api/v1/upload/image`
- **Auth**: Required (`Bearer <token>`)
- **Body**: `multipart/form-data`
  - `image`: File (JPG, PNG, WebP)
  - `folder`: String (optional, e.g. `"carousel"`)

##### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/ovxjar28/image/upload/v12345/lemon_academia/carousel/banner_1.webp",
    "publicId": "lemon_academia/carousel/banner_1",
    "format": "webp",
    "bytes": 345678
  }
}
```

---

## 5. 🎨 Seeded 6 Signature Craft Slides

The database automatically contains the initial 6 signature crafts:

1. **Lippan Mirror Work** (`category: "lippan-art"`, `order: 1`)
   - **Headline**: *"Learn. Create. Inspire."*
   - **Tagline**: *"Master the art of Lippan Mirror Work"*
   - **Route**: `"/courses"`

2. **Soy Candle Making** (`category: "candle-making"`, `order: 2`)
   - **Headline**: *"Crafted with Warmth & Aroma"*
   - **Tagline**: *"Artisan Soy Candle Making Masterclass"*
   - **Route**: `"/courses"`

3. **Ocean Resin Art** (`category: "resin-art"`, `order: 3`)
   - **Headline**: *"Fluid Dreams in Crystal Clear Resin"*
   - **Tagline**: *"Master Ocean Resin Art & Geodes"*
   - **Route**: `"/courses"`

4. **Mosaic Art Techniques** (`category: "mosaic-art"`, `order: 4`)
   - **Headline**: *"Assemble Colors Piece by Piece"*
   - **Tagline**: *"Mosaic Art & Tile Crafting"*
   - **Route**: `"/courses"`

5. **Clay Pottery & Sculpting** (`category: "pottery"`, `order: 5`)
   - **Headline**: *"Shape Earth into Timeless Art"*
   - **Tagline**: *"Hand-building Clay & Studio Pottery"*
   - **Route**: `"/courses"`

6. **Crochet & Fiber Arts** (`category: "crochet-basics"`, `order: 6`)
   - **Headline**: *"Knit. Weave. Express."*
   - **Tagline**: *"Artisan Crochet & Fiber Crafts"*
   - **Route**: `"/courses"`
