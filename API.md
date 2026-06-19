# 🚀 Blog System API Documentation

Complete API reference for the Blog System Service backend. All timestamps are in ISO 8601 format.

**Base URL:** `http://localhost:3000` (local) or your deployed server URL

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Authentication](#authentication)
3. [Auth Endpoints](#auth-endpoints)
4. [Blog Endpoints](#blog-endpoints)
5. [Comments Endpoints](#comments-endpoints)
6. [Upload Endpoints](#upload-endpoints)
7. [Error Handling](#error-handling)
8. [Response Formats](#response-formats)
9. [Complete Usage Examples](#complete-usage-examples)
10. [Helper Functions](#helper-functions)
11. [Frontend Integration Tips](#frontend-integration-tips)

---

## 🚀 Quick Reference

### Endpoints Overview

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| **Auth** |
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| GET | `/auth/profile` | ✅ | Get current user profile |
| **Blogs** |
| POST | `/blogs` | ✅ | Create blog |
| GET | `/blogs` | ❌ | Get all blogs (paginated) |
| GET | `/blogs/:slug` | ❌ | Get blog by slug |
| PATCH | `/blogs/:id` | ✅ | Update blog |
| DELETE | `/blogs/:id` | ✅ | Delete blog |
| **Comments** |
| POST | `/comments/blog/:blogId` | ❌ | Create comment |
| GET | `/comments` | ✅ | Get all comments (admin) |
| PATCH | `/comments/:id/status` | ✅ | Approve/reject comment |
| **Upload** |
| POST | `/upload` | ✅ | Upload image |

### Common Request/Response

**Register/Login Request:**
```json
{
  "username": "admin",
  "password": "pass123"
}
```

**Register/Login Response:**
```json
{
  "access_token": "eyJhbGc...",
  "username": "admin"
}
```

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication

### JWT Token

All protected endpoints require a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

**Token Format:** JWT (JSON Web Token) with the following claims:
- `sub`: User ID
- `username`: Username
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

**Token Expiration:** 24 hours (configurable)

### How to Get a Token

1. Register a new user or log in with existing credentials
2. Store the returned `access_token` in localStorage/sessionStorage
3. Include it in all protected endpoint requests

### Store JWT Token
```javascript
// After login/register
localStorage.setItem('token', response.access_token);

// For future requests
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`
};
```

---

## 🔑 Auth Endpoints

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `username`: 
  - Type: string
  - Required: true
  - Min length: 3 characters
  - Max length: 50 characters
- `password`:
  - Type: string
  - Required: true
  - Min length: 6 characters
  - Max length: 100 characters

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "securePassword123"
  }'
```

**JavaScript/Fetch:**
```javascript
async function register(username, password) {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid input format |
| 409 | Conflict | Username already exists |

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "securePassword123"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "securePassword123"
  }'
```

**JavaScript/Fetch:**
```javascript
async function login(username, password) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid input format |
| 401 | Unauthorized | Invalid credentials |

---

### 3. Get User Profile (Protected)

**Endpoint:** `GET /auth/profile`

**Access:** Protected (requires JWT)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript/Fetch:**
```javascript
async function getProfile(token) {
  const response = await fetch('http://localhost:3000/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "user": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "iat": 1700000000,
    "exp": 1700086400
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid JWT token |

---

## 📝 Blog Endpoints

### 1. Create Blog (Protected)

**Endpoint:** `POST /blogs`

**Access:** Protected (requires JWT)

**Request Body:**
```json
{
  "title": "Getting Started with NestJS",
  "slug": "getting-started-with-nestjs",
  "excerpt": "Learn the basics of NestJS framework for building scalable server-side applications",
  "content": "# Introduction\n\nNestJS is a progressive Node.js framework...",
  "coverImageUrl": "https://example.com/images/nestjs-cover.jpg",
  "additionalImages": [
    "https://example.com/images/nestjs-1.jpg",
    "https://example.com/images/nestjs-2.jpg"
  ]
}
```

**Validation Rules:**
- `title`: 
  - Type: string
  - Required: true
  - Min: 3 characters
  - Max: 255 characters
- `slug`:
  - Type: string
  - Optional: true (auto-generated if not provided)
  - Format: lowercase, alphanumeric, hyphens only (e.g., `my-blog-post`)
- `excerpt`:
  - Type: string
  - Required: true
  - Min: 10 characters
  - Max: 500 characters
- `content`:
  - Type: string
  - Required: true
  - Min: 20 characters
  - Supports Markdown format
- `coverImageUrl`:
  - Type: string (URL)
  - Required: true
  - Must start with http:// or https://
- `additionalImages`:
  - Type: array of URLs
  - Optional: true
  - Max items: 6
  - Each item must be valid URL with protocol

**cURL Example:**
```bash
curl -X POST http://localhost:3000/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with NestJS",
    "slug": "getting-started-with-nestjs",
    "excerpt": "Learn the basics of NestJS framework...",
    "content": "# Introduction\n\nNestJS is a progressive Node.js framework...",
    "coverImageUrl": "https://res.cloudinary.com/example/image/upload/nestjs-cover.jpg",
    "additionalImages": [
      "https://res.cloudinary.com/example/image/upload/nestjs-1.jpg",
      "https://res.cloudinary.com/example/image/upload/nestjs-2.jpg"
    ]
  }'
```

**JavaScript/Fetch:**
```javascript
async function createBlog(blogData, token) {
  const response = await fetch('http://localhost:3000/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(blogData)
  });

  if (!response.ok) {
    throw new Error('Failed to create blog');
  }

  return await response.json();
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started with NestJS",
  "slug": "getting-started-with-nestjs",
  "excerpt": "Learn the basics of NestJS framework...",
  "content": "# Introduction\n\nNestJS is a progressive Node.js framework...",
  "coverImageUrl": "https://example.com/images/nestjs-cover.jpg",
  "additionalImages": [
    "https://example.com/images/nestjs-1.jpg",
    "https://example.com/images/nestjs-2.jpg"
  ],
  "authorId": "user-id-123",
  "createdAt": "2026-06-19T10:30:00.000Z",
  "updatedAt": "2026-06-19T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid input format |
| 401 | Unauthorized | Missing or invalid JWT token |

---

### 2. Get All Blogs (Public)

**Endpoint:** `GET /blogs`

**Access:** Public

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number for pagination |
| limit | number | 10 | 100 | Items per page |
| search | string | - | - | Search in title and excerpt |

**cURL Examples:**
```bash
# Get first page with default limit
curl "http://localhost:3000/blogs"

# Get page 2 with 20 items per page
curl "http://localhost:3000/blogs?page=2&limit=20"

# Search for blogs
curl "http://localhost:3000/blogs?search=NestJS&page=1&limit=10"
```

**JavaScript/Fetch:**
```javascript
async function getBlogs(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  });

  const response = await fetch(`http://localhost:3000/blogs?${params}`);
  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Getting Started with NestJS",
      "slug": "getting-started-with-nestjs",
      "excerpt": "Learn the basics of NestJS framework...",
      "coverImageUrl": "https://example.com/images/nestjs-cover.jpg",
      "createdAt": "2026-06-19T10:30:00.000Z",
      "updatedAt": "2026-06-19T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Advanced NestJS Patterns",
      "slug": "advanced-nestjs-patterns",
      "excerpt": "Master advanced patterns in NestJS...",
      "coverImageUrl": "https://example.com/images/patterns.jpg",
      "createdAt": "2026-06-18T15:20:00.000Z",
      "updatedAt": "2026-06-18T15:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Get Blog by Slug (Public)

**Endpoint:** `GET /blogs/:slug`

**Access:** Public

**Path Parameters:**
- `slug` (string, required): URL-friendly slug of the blog

**cURL Examples:**
```bash
curl "http://localhost:3000/blogs/getting-started-with-nestjs"
curl "http://localhost:3000/blogs/my-first-blog-post"
```

**JavaScript/Fetch:**
```javascript
async function getBlogBySlug(slug) {
  const response = await fetch(`http://localhost:3000/blogs/${slug}`);
  if (!response.ok) {
    throw new Error('Blog not found');
  }
  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Getting Started with NestJS",
  "slug": "getting-started-with-nestjs",
  "excerpt": "Learn the basics of NestJS framework...",
  "content": "# Introduction\n\nNestJS is a progressive Node.js framework...",
  "coverImageUrl": "https://example.com/images/nestjs-cover.jpg",
  "additionalImages": [
    "https://example.com/images/nestjs-1.jpg",
    "https://example.com/images/nestjs-2.jpg"
  ],
  "authorId": "user-id-123",
  "createdAt": "2026-06-19T10:30:00.000Z",
  "updatedAt": "2026-06-19T10:30:00.000Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Not Found | Blog with given slug not found |

---

### 4. Update Blog (Protected)

**Endpoint:** `PATCH /blogs/:id`

**Access:** Protected (requires JWT)

**Path Parameters:**
- `id` (string, required): UUID of the blog

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt with more details",
  "content": "Updated content...",
  "coverImageUrl": "https://example.com/images/new-cover.jpg",
  "additionalImages": ["https://example.com/images/new-1.jpg"],
  "slug": "updated-slug"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/blogs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "excerpt": "Updated excerpt"
  }'
```

**JavaScript/Fetch:**
```javascript
async function updateBlog(blogId, updates, token) {
  const response = await fetch(
    `http://localhost:3000/blogs/${blogId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update blog');
  }

  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "slug": "updated-slug",
  "excerpt": "Updated excerpt with more details",
  "content": "Updated content...",
  "coverImageUrl": "https://example.com/images/new-cover.jpg",
  "additionalImages": ["https://example.com/images/new-1.jpg"],
  "authorId": "user-id-123",
  "createdAt": "2026-06-19T10:30:00.000Z",
  "updatedAt": "2026-06-19T11:45:00.000Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid input format |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Blog not found |

---

### 5. Delete Blog (Protected)

**Endpoint:** `DELETE /blogs/:id`

**Access:** Protected (requires JWT)

**Path Parameters:**
- `id` (string, required): UUID of the blog

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/blogs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/Fetch:**
```javascript
async function deleteBlog(blogId, token) {
  const response = await fetch(
    `http://localhost:3000/blogs/${blogId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete blog');
  }

  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "message": "Blog deleted successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Blog not found |

---

## 💬 Comments Endpoints

### 1. Create Comment (Public)

**Endpoint:** `POST /comments/blog/:blogId`

**Access:** Public (no authentication required)

**Path Parameters:**
- `blogId` (string, required): UUID of the blog

**Request Body:**
```json
{
  "senderName": "John Doe",
  "content": "นี่คือความคิดเห็นที่ยอดเยี่ยม!"
}
```

**Validation Rules:**
- `senderName`:
  - Type: string
  - Required: true
  - Max: 100 characters
- `content`:
  - Type: string
  - Required: true
  - Max: 1000 characters
  - Allowed characters: Thai (ก-๙), digits (0-9), basic punctuation, spaces

**cURL Example:**
```bash
curl -X POST "http://localhost:3000/comments/blog/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "John Doe",
    "content": "นี่คือความคิดเห็นที่ยอดเยี่ยม! ขอบคุณมากสำหรับบทความนี้"
  }'
```

**JavaScript/Fetch:**
```javascript
async function createComment(blogId, commentData) {
  const response = await fetch(
    `http://localhost:3000/comments/blog/${blogId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create comment');
  }

  return await response.json();
}
```

**Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "blogId": "550e8400-e29b-41d4-a716-446655440000",
  "senderName": "John Doe",
  "content": "นี่คือความคิดเห็นที่ยอดเยี่ยม!",
  "status": "PENDING",
  "createdAt": "2026-06-19T14:20:00.000Z",
  "updatedAt": "2026-06-19T14:20:00.000Z"
}
```

**Status Values:**
- `PENDING`: Comment awaiting admin approval (default)
- `APPROVED`: Comment approved and visible
- `REJECTED`: Comment rejected and hidden

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid input format |
| 404 | Not Found | Blog not found |

---

### 2. Get All Comments (Protected - Admin Only)

**Endpoint:** `GET /comments`

**Access:** Protected (requires JWT)

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number for pagination |
| limit | number | 10 | 50 | Items per page |
| status | string | - | - | Filter by status: PENDING, APPROVED, or REJECTED |

**cURL Examples:**
```bash
# Get all comments (default pagination)
curl "http://localhost:3000/comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get pending comments only
curl "http://localhost:3000/comments?status=PENDING&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get approved comments
curl "http://localhost:3000/comments?status=APPROVED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/Fetch:**
```javascript
async function getAllComments(token, status = null, page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status })
  });

  const response = await fetch(
    `http://localhost:3000/comments?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "blogId": "550e8400-e29b-41d4-a716-446655440000",
      "senderName": "John Doe",
      "content": "นี่คือความคิดเห็นที่ยอดเยี่ยม!",
      "status": "PENDING",
      "createdAt": "2026-06-19T14:20:00.000Z",
      "updatedAt": "2026-06-19T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid JWT token |

---

### 3. Update Comment Status (Protected - Admin Only)

**Endpoint:** `PATCH /comments/:id/status`

**Access:** Protected (requires JWT)

**Path Parameters:**
- `id` (string, required): UUID of the comment

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Allowed Status Transitions:**
- `PENDING` → `APPROVED`
- `PENDING` → `REJECTED`
- `APPROVED` → `REJECTED`
- `REJECTED` → `APPROVED`

**cURL Example:**
```bash
curl -X PATCH "http://localhost:3000/comments/770e8400-e29b-41d4-a716-446655440002/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'
```

**JavaScript/Fetch:**
```javascript
async function updateCommentStatus(commentId, status, token) {
  const response = await fetch(
    `http://localhost:3000/comments/${commentId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update comment status');
  }

  return await response.json();
}
```

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "blogId": "550e8400-e29b-41d4-a716-446655440000",
  "senderName": "John Doe",
  "content": "นี่คือความคิดเห็นที่ยอดเยี่ยม!",
  "status": "APPROVED",
  "createdAt": "2026-06-19T14:20:00.000Z",
  "updatedAt": "2026-06-19T14:25:00.000Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | Invalid status value |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Comment not found |

---

## 📤 Upload Endpoints

### 1. Upload Image (Protected)

**Endpoint:** `POST /upload`

**Access:** Protected (requires JWT)

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `file` (required): Image file

**File Constraints:**
- **Max Size:** 5 MB
- **Allowed Types:** 
  - `image/jpeg` (.jpg, .jpeg)
  - `image/png` (.png)
  - `image/webp` (.webp)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**JavaScript/Fetch:**
```javascript
async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.imageUrl;
}
```

**Response (201 Created):**
```json
{
  "imageUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/blog_images/xyz123.jpg",
  "message": "Image uploaded successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | ValidationError | No file provided |
| 401 | Unauthorized | Missing or invalid JWT token |
| 415 | UnsupportedMediaType | Invalid file type (not image) |
| 422 | UnprocessableEntity | File exceeds 5MB limit |

---

## ❌ Error Handling

### Error Response Format

All errors follow this standard format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Common HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful DELETE (sometimes) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate username) |
| 415 | Unsupported Media Type | Invalid file type |
| 422 | Unprocessable Entity | Validation failed (e.g., file too large) |
| 500 | Internal Server Error | Server error |

---

## 📦 Response Formats

### Pagination Response

List endpoints return paginated responses:

```json
{
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Timestamps

All timestamps are in ISO 8601 UTC format:
```
2026-06-19T10:30:00.000Z
```

### Data Types Reference

| Type | Format | Example |
|------|--------|---------|
| UUID | v4 | `550e8400-e29b-41d4-a716-446655440000` |
| DateTime | ISO 8601 UTC | `2026-06-19T10:30:00.000Z` |
| URL | http/https | `https://example.com/image.jpg` |
| Slug | lowercase, alphanumeric, hyphens | `my-blog-post-title` |

---

## 🔗 Complete Usage Examples

### Complete Workflow Example

#### 1. Register/Login
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass123"}'

# Response
{"access_token":"eyJhbGc...","username":"admin"}

# Save the token
TOKEN="eyJhbGc..."
```

#### 2. Upload Blog Images
```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@cover-image.jpg"

# Response
{"imageUrl":"https://res.cloudinary.com/...","message":"Image uploaded successfully"}

COVER_IMAGE="https://res.cloudinary.com/..."
```

#### 3. Create Blog
```bash
curl -X POST http://localhost:3000/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My First Blog",
    "excerpt":"This is my first blog post",
    "content":"# Introduction\n\nContent here...",
    "coverImageUrl":"'$COVER_IMAGE'",
    "slug":"my-first-blog"
  }'
```

#### 4. Get Blog
```bash
curl http://localhost:3000/blogs/my-first-blog
```

#### 5. Create Comment
```bash
curl -X POST http://localhost:3000/comments/blog/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "senderName":"John Doe",
    "content":"Great blog post!"
  }'
```

---

## 🛠️ Helper Functions

### Complete TypeScript API Client

```typescript
// api.ts - Centralized API client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return await response.json();
  }

  // Auth
  register(username: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Blogs
  getBlogs(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return this.request(`/blogs?${params}`);
  }

  getBlogBySlug(slug: string) {
    return this.request(`/blogs/${slug}`);
  }

  createBlog(blogData: any) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  updateBlog(id: string, updates: any) {
    return this.request(`/blogs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  deleteBlog(id: string) {
    return this.request(`/blogs/${id}`, { method: 'DELETE' });
  }

  // Comments
  createComment(blogId: string, commentData: any) {
    return this.request(`/comments/blog/${blogId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  getComments(page = 1, limit = 10, status?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return this.request(`/comments?${params}`);
  }

  updateCommentStatus(id: string, status: string) {
    return this.request(`/comments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Upload
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: any = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  }
}

export default ApiClient;
```

### Usage Example

```typescript
const api = new ApiClient();

// Login
const { access_token } = await api.login('admin', 'password123');
api.setToken(access_token);

// Get blogs
const { data, pagination } = await api.getBlogs(1, 10);
console.log(`Total blogs: ${pagination.total}`);

// Get single blog
const blog = await api.getBlogBySlug('my-first-blog');
console.log(blog.title);

// Create comment
const comment = await api.createComment(blog.id, {
  senderName: 'John',
  content: 'Great post!',
});
console.log(`Comment created with status: ${comment.status}`);
```

---

## 🚀 Frontend Integration Tips

### 1. API Base URL Configuration
```javascript
// config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Usage
const response = await fetch(`${API_BASE_URL}/blogs`);
```

### 2. Handle JWT Expiration
```javascript
// Intercept 401 responses
const handleUnauthorized = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

### 3. Image Upload Handling
```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  const data = await response.json();
  return data.imageUrl;
};
```

### 4. Error Handling Best Practices
```javascript
// Create error interceptor
const handleApiError = (error) => {
  if (error.statusCode === 401) {
    // Handle unauthorized - redirect to login
    handleUnauthorized();
  } else if (error.statusCode === 404) {
    // Handle not found
    console.error('Resource not found');
  } else if (error.statusCode >= 500) {
    // Handle server errors
    console.error('Server error occurred');
  }
};
```

### 5. CORS Configuration
- Configure CORS settings on backend if frontend is on different domain
- Ensure credentials are properly sent with requests

### 6. Rate Limiting & Performance
- Implement rate limiting on frontend to prevent API abuse
- Cache GET requests appropriately for performance
- Always show loading indicators during API calls

### 7. Validation
- Validate data on frontend before sending to API
- Display validation errors to users
- Use proper loading and error states

---

## 📝 Notes

- Replace `YOUR_JWT_TOKEN` with actual token from login/register
- Replace placeholder IDs and values with real data
- For file uploads, ensure file exists and has correct permissions
- Always handle errors appropriately in production code
- Consider implementing retry logic for failed requests
- Use environment variables for API base URL
- Log API errors for debugging purposes
- Implement proper error boundaries in React components
