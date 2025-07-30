# API Endpoints Documentation

## Base URL

```
http://localhost:4000/api
```

## Swagger Documentation

```
http://localhost:4000/api/docs
```

---

## 🔐 Authentication Endpoints

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "สมชาย ใจดี",
  "role": "USER" // optional: USER | ADMIN
}
```

**Response (Success):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "สมชาย ใจดี",
    "role": "USER"
  }
}
```

**Error Messages:**

- `409`: "อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใช้อีเมลอื่นหรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว"
- `400`: "รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%\*?&)"

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (Success):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "สมชาย ใจดี",
    "role": "USER"
  }
}
```

**Error Messages:**

- `401`: "ไม่พบบัญชีผู้ใช้งานที่ตรงกับอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้งหรือสมัครสมาชิกใหม่"
- `401`: "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง"
- `401`: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ"

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Create Admin (Admin Only)

```http
POST /api/auth/create-admin
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "name": "ผู้ดูแลระบบ"
}
```

### Clear All Sessions (Development)

```http
POST /api/auth/clear-sessions
```

### Logout All Users (Admin Only)

```http
POST /api/auth/logout-all
Authorization: Bearer <admin_access_token>
```

---

## 👥 Users Endpoints

### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin_access_token>
```

### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <access_token>
```

### Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "ผู้ใช้ใหม่",
  "role": "USER"
}
```

### Update User

```http
PATCH /api/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "email": "newemail@example.com",
  "role": "ADMIN",
  "isActive": true
}
```

### Delete User (Admin Only)

```http
DELETE /api/users/:id
Authorization: Bearer <admin_access_token>
```

### Deactivate User (Admin Only)

```http
PATCH /api/users/:id/deactivate
Authorization: Bearer <admin_access_token>
```

### Activate User (Admin Only)

```http
PATCH /api/users/:id/activate
Authorization: Bearer <admin_access_token>
```

---

## 📝 Posts Endpoints

### Get All Posts

```http
GET /api/posts
Authorization: Bearer <access_token>
```

### Get My Posts

```http
GET /api/posts/my-posts
Authorization: Bearer <access_token>
```

### Get Post by ID

```http
GET /api/posts/:id
Authorization: Bearer <access_token>
```

### Create Post

```http
POST /api/posts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "หัวข้อโพสต์",
  "content": "เนื้อหาโพสต์...",
  "published": true
}
```

### Update Post

```http
PATCH /api/posts/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "หัวข้อใหม่",
  "content": "เนื้อหาใหม่...",
  "published": false
}
```

### Delete Post

```http
DELETE /api/posts/:id
Authorization: Bearer <access_token>
```

---

## 📁 File Upload Endpoints

### Upload Single Image

```http
POST /api/upload/images/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
- postId: "uuid-string" (optional)
```

### Upload Multiple Images

```http
POST /api/upload/images/multiple
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- images: <file[]> (max 10 files)
- postId: "uuid-string" (optional)
```

### Get My Images

```http
GET /api/upload/images/my-images
Authorization: Bearer <access_token>
```

### Get Images by Post

```http
GET /api/upload/images/post/:postId
Authorization: Bearer <access_token>
```

### Delete Image

```http
DELETE /api/upload/images/:fileId
Authorization: Bearer <access_token>
```

### Upload Single Document

```http
POST /api/upload/documents/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- document: <file>
- postId: "uuid-string" (optional)
```

### Upload Multiple Documents

```http
POST /api/upload/documents/multiple
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- documents: <file[]> (max 5 files)
- postId: "uuid-string" (optional)
```

### Get My Documents

```http
GET /api/upload/documents/my-documents
Authorization: Bearer <access_token>
```

### Get Documents by Post

```http
GET /api/upload/documents/post/:postId
Authorization: Bearer <access_token>
```

### Delete Document

```http
DELETE /api/upload/documents/:fileId
Authorization: Bearer <access_token>
```

---

## 📂 File Management Endpoints

### Get My Files

```http
GET /api/files/my-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `type`: IMAGE | DOCUMENT | VIDEO | AUDIO | OTHER
- `status`: UPLOADING | PROCESSING | COMPLETED | FAILED
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Get All Files

```http
GET /api/files/all-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <access_token>
```

### Get File Statistics

```http
GET /api/files/stats
Authorization: Bearer <access_token>
```

### Get File Details

```http
GET /api/files/:fileId/details
Authorization: Bearer <access_token>
```

---

## 🏥 Health Check Endpoints

### Basic Health Check

```http
GET /api/health
```

### Detailed Health Check

```http
GET /api/health/detailed
```

### Error Statistics

```http
GET /api/health/errors
```

---

## 📊 Monitoring Endpoints

### Monitoring Dashboard

```http
GET /api/monitoring/dashboard
Authorization: Bearer <access_token>
```

### System Metrics

```http
GET /api/monitoring/system
Authorization: Bearer <access_token>
```

### Database Metrics

```http
GET /api/monitoring/database
Authorization: Bearer <access_token>
```

### Storage Metrics

```http
GET /api/monitoring/storage
Authorization: Bearer <access_token>
```

### API Metrics

```http
GET /api/monitoring/api?hours=24
Authorization: Bearer <access_token>
```

### Health Check (Monitoring)

```http
GET /api/monitoring/health
Authorization: Bearer <access_token>
```

### Active Alerts

```http
GET /api/monitoring/alerts
Authorization: Bearer <access_token>
```

### Performance Metrics

```http
GET /api/monitoring/performance?period=1h
Authorization: Bearer <access_token>
```

---

## 📋 Error Messages Endpoints

### Get Authentication Error Messages

```http
GET /api/error-messages/auth
```

**Response:**

```json
{
  "login": {
    "invalidEmail": "กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com",
    "userNotFound": "ไม่พบบัญชีผู้ใช้งานที่ตรงกับอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้งหรือสมัครสมาชิกใหม่",
    "wrongPassword": "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง",
    "accountSuspended": "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ"
  },
  "register": {
    "emailExists": "อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใช้อีเมลอื่นหรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว",
    "weakPassword": "รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)",
    "shortPassword": "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
  }
}
```

### Get Validation Error Messages

```http
GET /api/error-messages/validation
```

### Get UI Error Messages

```http
GET /api/error-messages/ui
```

### Get All Error Messages

```http
GET /api/error-messages/all
```

---

## 🎨 Frontend Helper Endpoints

### Get Specific Error Message

```http
GET /api/frontend/error-message?type=login&field=email&code=invalid
```

**Query Parameters:**

- `type`: login | register | validation
- `field`: email | password | name | general
- `code`: invalid | notFound | wrong | empty | etc.

### Get Form Configuration

```http
GET /api/frontend/form-config
```

**Response:**

```json
{
  "login": {
    "fields": [
      {
        "name": "email",
        "type": "email",
        "label": "ที่อยู่อีเมล",
        "placeholder": "กรอกอีเมลของคุณ",
        "required": true,
        "validation": {
          "required": "กรุณากรอกที่อยู่อีเมลของคุณ",
          "email": "กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com"
        }
      }
    ]
  }
}
```

### Get UI Text

```http
GET /api/frontend/ui-text
```

---

## 🔒 Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 HTTP Status Codes

### Success Codes

- `200`: OK - Request successful
- `201`: Created - Resource created successfully

### Error Codes

- `400`: Bad Request - ข้อมูลไม่ถูกต้อง
- `401`: Unauthorized - การยืนยันตัวตนไม่สำเร็จ
- `403`: Forbidden - ไม่มีสิทธิ์เข้าถึง
- `404`: Not Found - ไม่พบข้อมูลที่ต้องการ
- `409`: Conflict - ข้อมูลซ้ำซ้อน
- `429`: Too Many Requests - คำขอมากเกินไป
- `500`: Internal Server Error - เกิดข้อผิดพลาดของระบบ

---

## 🌐 CORS Configuration

The API accepts requests from:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)

---

## 🔧 Rate Limiting

- **Global**: 1000 requests per 15 minutes per IP
- **Auth Register**: 5 requests per minute
- **Auth Login**: 10 requests per minute
- **Auth Refresh**: 5 requests per minute
- **Image Upload Single**: 10 requests per minute
- **Image Upload Multiple**: 5 requests per minute
- **Document Upload Single**: 5 requests per minute
- **Document Upload Multiple**: 3 requests per minute

---

## 📝 Password Requirements

รหัสผ่านต้องมีคุณสมบัติดังนี้:

- ความยาวอย่างน้อย 8 ตัวอักษร
- มีตัวอักษรพิมพ์เล็ก (a-z)
- มีตัวอักษรพิมพ์ใหญ่ (A-Z)
- มีตัวเลข (0-9)
- มีอักขระพิเศษ (@$!%\*?&)

**ตัวอย่างรหัสผ่านที่ถูกต้อง:** `Password123!`

---

## 🚀 Quick Start for Frontend

1. **Login Flow:**

```javascript
// Login
const response = await fetch("http://localhost:4000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "Password123!",
  }),
});

const data = await response.json();

if (response.ok) {
  // Store tokens
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));
} else {
  // Show error message
  console.error(data.message);
}
```

2. **Protected API Call:**

```javascript
const token = localStorage.getItem("access_token");

const response = await fetch("http://localhost:4000/api/posts", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

3. **Error Handling:**

```javascript
if (!response.ok) {
  const errorData = await response.json();

  // Display Thai error message
  if (errorData.message) {
    showErrorMessage(errorData.message);
  }
}
```

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา
