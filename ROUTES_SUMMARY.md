# 📋 สรุป Routes ทั้งหมดในโปรเจค NestJS API

## 🌐 Base URL
```
http://localhost:4000/api
```

## 📚 Swagger Documentation
```
http://localhost:4000/api/docs
```

---

## 🔐 Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/auth/register` | สมัครสมาชิกใหม่ | ❌ | - |
| `POST` | `/auth/login` | เข้าสู่ระบบ | ❌ | - |
| `GET` | `/auth/profile` | ดูข้อมูลโปรไฟล์ | ✅ | - |
| `POST` | `/auth/refresh` | รีเฟรช token | ❌ | - |
| `POST` | `/auth/logout` | ออกจากระบบ | ✅ | - |
| `POST` | `/auth/create-admin` | สร้าง admin (Admin only) | ✅ | ADMIN |
| `POST` | `/auth/logout-all` | ออกจากระบบทั้งหมด (Admin only) | ✅ | ADMIN |
| `POST` | `/auth/clear-sessions` | ล้าง session ทั้งหมด (Development) | ❌ | - |

---

## 👥 Users Routes (`/users`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/users` | สร้างผู้ใช้ใหม่ | ✅ | ADMIN |
| `GET` | `/users` | ดูผู้ใช้ทั้งหมด | ✅ | ADMIN |
| `GET` | `/users/:id` | ดูข้อมูลผู้ใช้ตาม ID | ✅ | - |
| `PATCH` | `/users/:id` | แก้ไขข้อมูลผู้ใช้ | ✅ | - |
| `DELETE` | `/users/:id` | ลบผู้ใช้ | ✅ | ADMIN |
| `PATCH` | `/users/:id/deactivate` | ระงับการใช้งานผู้ใช้ | ✅ | ADMIN |
| `PATCH` | `/users/:id/activate` | เปิดใช้งานผู้ใช้ | ✅ | ADMIN |

---

## 📝 Posts Routes (`/posts`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/posts` | สร้างโพสต์ใหม่ | ✅ | - |
| `GET` | `/posts` | ดูโพสต์ทั้งหมด | ✅ | - |
| `GET` | `/posts/my-posts` | ดูโพสต์ของตัวเอง | ✅ | - |
| `GET` | `/posts/:id` | ดูโพสต์ตาม ID | ✅ | - |
| `PATCH` | `/posts/:id` | แก้ไขโพสต์ | ✅ | - |
| `DELETE` | `/posts/:id` | ลบโพสต์ | ✅ | - |

---

## 🖼️ Image Upload Routes (`/upload/images`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/upload/images/single` | อัปโหลดรูปภาพเดี่ยว | ✅ | - |
| `POST` | `/upload/images/multiple` | อัปโหลดรูปภาพหลายรูป | ✅ | - |
| `GET` | `/upload/images/my-images` | ดูรูปภาพของตัวเอง | ✅ | - |
| `GET` | `/upload/images/post/:postId` | ดูรูปภาพตามโพสต์ | ✅ | - |
| `DELETE` | `/upload/images/:fileId` | ลบรูปภาพ | ✅ | - |

---

## 📄 Document Upload Routes (`/upload/documents`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/upload/documents/single` | อัปโหลดเอกสารเดี่ยว | ✅ | - |
| `POST` | `/upload/documents/multiple` | อัปโหลดเอกสารหลายไฟล์ | ✅ | - |
| `GET` | `/upload/documents/my-documents` | ดูเอกสารของตัวเอง | ✅ | - |
| `GET` | `/upload/documents/post/:postId` | ดูเอกสารตามโพสต์ | ✅ | - |
| `DELETE` | `/upload/documents/:fileId` | ลบเอกสาร | ✅ | - |

---

## 🔧 Chunk Upload Routes (`/upload/chunk`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/upload/chunk/initiate` | เริ่มต้นการอัปโหลดแบบ chunk | ✅ | - |
| `POST` | `/upload/chunk/upload` | อัปโหลด chunk | ✅ | - |
| `POST` | `/upload/chunk/complete` | เสร็จสิ้นการอัปโหลด | ✅ | - |
| `GET` | `/upload/chunk/progress/:fileId` | ดูความคืบหน้าการอัปโหลด | ✅ | - |
| `DELETE` | `/upload/chunk/cancel/:fileId` | ยกเลิกการอัปโหลด | ✅ | - |

---

## 📂 File Management Routes (`/files`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/files/my-files` | ดูไฟล์ของตัวเอง | ✅ | - |
| `GET` | `/files/all-files` | ดูไฟล์ทั้งหมด | ✅ | - |
| `GET` | `/files/stats` | ดูสถิติไฟล์ | ✅ | - |
| `GET` | `/files/:fileId/details` | ดูรายละเอียดไฟล์ | ✅ | - |

---

## 📁 File Serve Routes (`/files`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/files/serve/images/:filename` | แสดงรูปภาพ | ❌ | - |
| `GET` | `/files/serve/documents/:filename` | แสดงเอกสาร | ❌ | - |
| `GET` | `/files/serve/videos/:filename` | แสดงวิดีโอ | ❌ | - |
| `GET` | `/files/serve/audio/:filename` | แสดงไฟล์เสียง | ❌ | - |
| `GET` | `/files/serve/thumbnails/:filename` | แสดง thumbnail | ❌ | - |
| `GET` | `/files/download/:fileId` | ดาวน์โหลดไฟล์ | ✅ | - |
| `GET` | `/files/info/:fileId` | ดูข้อมูลไฟล์ | ✅ | - |
| `GET` | `/files/list` | รายการไฟล์ | ✅ | - |

---

## 🏥 Health Check Routes (`/health`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/health` | ตรวจสอบสถานะพื้นฐาน | ❌ | - |
| `GET` | `/health/detailed` | ตรวจสอบสถานะแบบละเอียด | ❌ | - |
| `GET` | `/health/errors` | ดูสถิติข้อผิดพลาด | ❌ | - |

---

## 📊 Monitoring Routes (`/monitoring`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/monitoring/dashboard` | แดชบอร์ดการติดตาม | ✅ | - |
| `GET` | `/monitoring/system` | ข้อมูลระบบ | ✅ | - |
| `GET` | `/monitoring/database` | ข้อมูลฐานข้อมูล | ✅ | - |
| `GET` | `/monitoring/storage` | ข้อมูลการจัดเก็บ | ✅ | - |
| `GET` | `/monitoring/api` | ข้อมูล API | ✅ | - |
| `GET` | `/monitoring/health` | ตรวจสอบสถานะการติดตาม | ✅ | - |
| `GET` | `/monitoring/alerts` | ดูการแจ้งเตือน | ✅ | - |
| `GET` | `/monitoring/performance` | ดูประสิทธิภาพ | ✅ | - |

---

## ❌ Error Messages Routes (`/error-messages`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/error-messages/auth` | ข้อความข้อผิดพลาดการยืนยันตัวตน | ❌ | - |
| `GET` | `/error-messages/validation` | ข้อความข้อผิดพลาดการตรวจสอบ | ❌ | - |
| `GET` | `/error-messages/ui` | ข้อความข้อผิดพลาด UI | ❌ | - |
| `GET` | `/error-messages/all` | ข้อความข้อผิดพลาดทั้งหมด | ❌ | - |

---

## 🎨 Frontend Helper Routes (`/frontend`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/frontend/error-message` | ข้อความข้อผิดพลาดเฉพาะ | ❌ | - |
| `GET` | `/frontend/form-config` | การตั้งค่าฟอร์ม | ❌ | - |
| `GET` | `/frontend/ui-text` | ข้อความ UI | ❌ | - |

---

## 🏠 App Routes (`/`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/` | หน้าแรก | ❌ | - |
| `GET` | `/health` | ตรวจสอบสถานะ (duplicate) | ❌ | - |

---

## 📋 สรุปตามหมวดหมู่

### 🔐 Authentication & Authorization
- **8 routes** สำหรับการจัดการการยืนยันตัวตน
- รองรับการสมัครสมาชิก, เข้าสู่ระบบ, จัดการ token
- มีระบบ role-based access control (USER/ADMIN)

### 👥 User Management
- **7 routes** สำหรับการจัดการผู้ใช้
- Admin สามารถจัดการผู้ใช้ทั้งหมดได้
- ผู้ใช้ทั่วไปสามารถแก้ไขข้อมูลตัวเองได้

### 📝 Content Management
- **6 routes** สำหรับการจัดการโพสต์
- ผู้ใช้สามารถสร้าง, แก้ไข, ลบโพสต์ของตัวเองได้

### 📁 File Management
- **Image Upload**: 5 routes
- **Document Upload**: 5 routes
- **Chunk Upload**: 5 routes (สำหรับไฟล์ขนาดใหญ่)
- **File Management**: 4 routes
- **File Serve**: 8 routes
- **รวม**: 27 routes สำหรับการจัดการไฟล์

### 🏥 System Monitoring
- **Health Check**: 3 routes
- **Monitoring**: 8 routes
- รวม 11 routes สำหรับการติดตามระบบ

### 🎨 Frontend Support
- **Error Messages**: 4 routes
- **Frontend Helper**: 3 routes
- รวม 7 routes สำหรับสนับสนุน frontend

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Access token และ refresh token
- Rate limiting สำหรับ endpoints สำคัญ
- Session management

### Authorization
- Role-based access control (RBAC)
- User role: USER, ADMIN
- Resource ownership validation
- Admin-only endpoints

### File Security
- File type validation
- File size limits
- Secure file serving
- Ownership verification

---

## 📊 Statistics

- **Total Routes**: 69 routes
- **Public Routes**: 15 routes (ไม่ต้อง authentication)
- **Protected Routes**: 54 routes (ต้อง authentication)
- **Admin-only Routes**: 8 routes

### หมวดหมู่ตามจำนวน routes:
1. **File Management**: 27 routes (39%)
2. **Authentication**: 8 routes (12%)
3. **Monitoring**: 11 routes (16%)
4. **User Management**: 7 routes (10%)
5. **Posts**: 6 routes (9%)
6. **Frontend Support**: 7 routes (10%)
7. **App**: 2 routes (3%)
8. **Error Messages**: 4 routes (6%)

---

## 🚀 การใช้งาน

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
# Development
npm run docker:dev:up

# Production
npm run docker:prod:up
```

---

*อัปเดตล่าสุด: $(date)* 