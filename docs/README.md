# 📚 คู่มือการใช้งานระบบ NestJS Authentication & File Upload API

ยินดีต้อนรับสู่คู่มือการใช้งานที่ครอบคลุมสำหรับระบบ NestJS Authentication & File Upload API

## 🎯 ภาพรวมระบบ

ระบบนี้เป็น RESTful API ที่สร้างด้วย NestJS พร้อมด้วยระบบ authentication, file upload, monitoring และ user management ที่ครบครัน

### คุณสมบัติหลัก
- 🔐 **Authentication & Authorization** - JWT-based authentication พร้อม role-based access control
- 📁 **File Upload System** - รองรับการอัปโหลดไฟล์หลายประเภทพร้อม hybrid storage
- 📊 **Monitoring & Analytics** - ระบบ monitoring แบบ real-time
- 👥 **User Management** - การจัดการผู้ใช้และสิทธิ์
- 🗄️ **Database Management** - PostgreSQL พร้อม Prisma ORM
- 🔒 **Security Features** - มาตรการความปลอดภัยหลายชั้น
- 🏥 **Health Checks** - ระบบตรวจสอบสุขภาพแอปพลิเคชัน

## 📖 คู่มือการใช้งาน

### 🚀 เริ่มต้นใช้งาน
1. **[คู่มือการติดตั้งระบบ](01-installation-guide.md)**
   - ความต้องการของระบบ
   - การติดตั้งแบบ Local Development
   - การติดตั้งด้วย Docker
   - การแก้ไขปัญหาที่พบบ่อย

### 🔐 ระบบ Authentication
2. **[คู่มือระบบ Authentication](02-authentication-guide.md)**
   - การสมัครสมาชิกและเข้าสู่ระบบ
   - JWT Token management
   - Role-based authorization
   - Security best practices

### 📁 ระบบ File Upload
3. **[คู่มือระบบ File Upload](03-file-upload-guide.md)**
   - การอัปโหลดไฟล์ประเภทต่างๆ
   - Hybrid storage system (Supabase + Local)
   - Image processing และ thumbnails
   - Chunk upload สำหรับไฟล์ขนาดใหญ่

### 📊 ระบบ Monitoring
4. **[คู่มือระบบ Monitoring และ Analytics](04-monitoring-guide.md)**
   - System metrics และ performance monitoring
   - Database และ storage analytics
   - API performance tracking
   - Real-time monitoring dashboard

### 🚀 การ Deploy
5. **[คู่มือการ Deploy ระบบ](05-deployment-guide.md)**
   - Docker deployment
   - Traditional server deployment
   - Cloud platform deployment
   - Automated deployment

### 🧪 การทดสอบ API
6. **[คู่มือการทดสอบ API](06-api-testing-guide.md)**
   - Manual testing ด้วย Postman
   - Automated testing scripts
   - Performance testing
   - Integration testing

### 🏥 Health Checks
7. **[คู่มือระบบ Health Check](07-health-check-guide.md)**
   - Basic และ detailed health checks
   - Docker และ Kubernetes health checks
   - Monitoring และ alerting
   - Health check dashboard

### 🗄️ การจัดการ Database
8. **[คู่มือการจัดการ Database](08-database-guide.md)**
   - Database schema และ migrations
   - Query optimization
   - Backup และ restore
   - Performance tuning

### 🔒 ความปลอดภัย
9. **[คู่มือความปลอดภัย](09-security-guide.md)**
   - Authentication security
   - Data protection
   - Network security
   - Security monitoring

### 🔧 การแก้ไขปัญหา
10. **[คู่มือการแก้ไขปัญหา](10-troubleshooting-guide.md)**
    - ปัญหาที่พบบ่อยและวิธีแก้ไข
    - Debug tools และ techniques
    - Performance troubleshooting
    - Error handling

### 👥 การจัดการผู้ใช้
11. **[คู่มือการจัดการผู้ใช้](11-user-management-guide.md)**
    - User roles และ permissions
    - User management APIs
    - Bulk operations
    - User analytics

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **File Storage**: Supabase Storage / Local Storage
- **Image Processing**: Sharp
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: Class Validator
- **Testing**: Jest, Newman (Postman)

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd nest-auth-api

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ

# 4. Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# 5. Start application
npm run start:dev
```

## 📋 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/refresh` - รีเฟรช token
- `GET /api/auth/profile` - ดูข้อมูลโปรไฟล์

### File Upload
- `POST /api/upload/images/single` - อัปโหลดรูปภาพเดี่ยว
- `POST /api/upload/images/multiple` - อัปโหลดรูปภาพหลายไฟล์
- `POST /api/upload/documents/single` - อัปโหลดเอกสาร
- `GET /api/files/my-files` - ดูไฟล์ของตัวเอง

### User Management
- `GET /api/users` - ดูรายชื่อผู้ใช้ทั้งหมด (Admin)
- `GET /api/users/:id` - ดูข้อมูลผู้ใช้
- `PUT /api/users/:id` - แก้ไขข้อมูลผู้ใช้
- `DELETE /api/users/:id` - ลบผู้ใช้ (Admin)

### Monitoring
- `GET /api/monitoring/dashboard` - Dashboard overview
- `GET /api/monitoring/system` - System metrics
- `GET /api/monitoring/performance` - API performance
- `GET /health` - Basic health check

## 🧪 การทดสอบ

```bash
# รัน unit tests
npm test

# รัน API tests
npm run test:api

# รัน specific test groups
npm run test:api:auth
npm run test:api:upload
npm run test:api:monitoring
```

## 📊 Monitoring

ระบบมี monitoring dashboard ที่แสดง:
- System metrics (CPU, Memory, Disk)
- Database performance
- API response times
- File upload statistics
- User activity analytics

เข้าถึงได้ที่: `http://localhost:4000/api/monitoring/dashboard`

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation และ sanitization
- File upload security
- CORS protection
- Security headers (Helmet)
- Password hashing (Argon2)

## 🐳 Docker Support

```bash
# Development
npm run docker:dev:up

# Production
npm run docker:prod:up

# Build custom image
docker build -t nest-auth-api .
```

## 📝 Environment Variables

สำคัญที่ต้องตั้งค่า:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_TOKEN_SECRET="your-refresh-token-secret"

# Application
PORT=4000
NODE_ENV=development

# Supabase (Optional)
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [คู่มือการแก้ไขปัญหา](10-troubleshooting-guide.md)
2. ดูใน GitHub Issues
3. ตรวจสอบ logs: `npm run start:dev`
4. ใช้ health check: `curl http://localhost:4000/health`

## 🔄 Updates & Maintenance

- Regular security updates
- Database migrations
- Performance monitoring
- Log rotation
- Backup strategies

---

**สร้างด้วย ❤️ โดยใช้ NestJS**

> 💡 **เคล็ดลับ**: เริ่มต้นด้วย [คู่มือการติดตั้ง](01-installation-guide.md) แล้วตามด้วย [คู่มือ Authentication](02-authentication-guide.md) เพื่อความเข้าใจที่ดีที่สุด