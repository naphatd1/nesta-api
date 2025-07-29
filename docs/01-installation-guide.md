# คู่มือการติดตั้งระบบ

## 📋 ความต้องการของระบบ

### Software Requirements
- **Node.js**: เวอร์ชัน 20 หรือสูงกว่า
- **PostgreSQL**: เวอร์ชัน 15 หรือสูงกว่า
- **npm**: มาพร้อมกับ Node.js
- **Git**: สำหรับ clone repository

### Optional Requirements
- **Docker**: สำหรับการ deploy แบบ containerized
- **Redis**: สำหรับ caching (ถ้าต้องการ)

## 🚀 การติดตั้งแบบ Local Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd nest-auth-api
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
# คัดลอก template
cp .env.example .env

# แก้ไขไฟล์ .env
nano .env
```

#### ตัวอย่างการตั้งค่า .env:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Application Configuration
PORT=4000
NODE_ENV=development

# Supabase Configuration (Optional)
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. ตั้งค่า Database

#### สร้าง Database
```bash
# เข้าไปใน PostgreSQL
psql -U postgres

# สร้าง database
CREATE DATABASE your_database_name;

# สร้าง user (ถ้าต้องการ)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
```

#### รัน Migrations
```bash
# Generate Prisma client
npx prisma generate

# รัน database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. เริ่มต้นใช้งาน
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 6. ตรวจสอบการติดตั้ง
```bash
# ตรวจสอบว่า server รันอยู่
npm run check:server

# ทดสอบ API
curl http://localhost:4000/api/health
```

## 🐳 การติดตั้งด้วย Docker

### 1. ติดตั้ง Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# macOS (ใช้ Docker Desktop)
# ดาวน์โหลดจาก https://www.docker.com/products/docker-desktop
```

### 2. รัน Docker Compose
```bash
# Development
npm run docker:dev:up

# Production
npm run docker:prod:up
```

### 3. ตรวจสอบ Containers
```bash
# ดู status
docker-compose ps

# ดู logs
docker-compose logs -f
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### ปัญหา Database Connection
```bash
# ตรวจสอบ PostgreSQL service
sudo systemctl status postgresql

# เริ่ม PostgreSQL
sudo systemctl start postgresql

# ตรวจสอบ connection string ใน .env
```

### ปัญหา Port ถูกใช้งาน
```bash
# หา process ที่ใช้ port 4000
lsof -i :4000

# หยุด process
kill -9 <PID>
```

### ปัญหา Permissions
```bash
# ตั้งค่า permissions สำหรับ uploads
chmod -R 755 uploads/

# ตั้งค่า ownership
chown -R $USER:$USER .
```

### ปัญหา Node Modules
```bash
# ลบและติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

## 📊 การตรวจสอบสถานะระบบ

### Health Checks
```bash
# Basic health check
curl http://localhost:4000/api/health

# Detailed system status
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/monitoring/health
```

### Database Status
```bash
# ตรวจสอบ database connection
npx prisma db pull

# ดู database schema
npx prisma studio
```

## 🔒 การตั้งค่าความปลอดภัย

### JWT Secrets
- เปลี่ยน JWT_SECRET และ JWT_REFRESH_TOKEN_SECRET ให้เป็นค่าที่ปลอดภัย
- ใช้ random string ที่มีความยาวอย่างน้อย 32 characters

### Database Security
- ใช้ strong password สำหรับ database user
- จำกัด database access เฉพาะ IP ที่จำเป็น
- เปิดใช้งาน SSL connection ใน production

### Environment Variables
- ไม่เก็บ .env file ใน version control
- ใช้ environment-specific configurations
- เข้ารหัส sensitive data

## 📝 Next Steps

หลังจากติดตั้งเสร็จแล้ว:

1. อ่าน [Authentication Guide](02-authentication-guide.md)
2. ทดสอบ API ด้วย [API Testing Guide](06-api-testing-guide.md)
3. ตั้งค่า [File Upload System](03-file-upload-guide.md)
4. เรียนรู้ [Monitoring System](04-monitoring-guide.md)

## 🆘 การขอความช่วยเหลือ

หากพบปัญหาในการติดตั้ง:

1. ตรวจสอบ logs: `npm run start:dev`
2. ตรวจสอบ database connection
3. ตรวจสอบ environment variables
4. ดู troubleshooting section ในแต่ละ guide