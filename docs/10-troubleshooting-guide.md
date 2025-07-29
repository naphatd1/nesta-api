# คู่มือการแก้ไขปัญหา (Troubleshooting Guide)

## 🔧 ภาพรวมการแก้ไขปัญหา

คู่มือนี้รวบรวมปัญหาที่พบบ่อยและวิธีการแก้ไขสำหรับระบบ NestJS Authentication & File Upload API

### หมวดหมู่ปัญหา
- **Installation Issues**: ปัญหาการติดตั้ง
- **Authentication Problems**: ปัญหาระบบ authentication
- **File Upload Issues**: ปัญหาการอัปโหลดไฟล์
- **Database Problems**: ปัญหา database
- **Performance Issues**: ปัญหาประสิทธิภาพ
- **Deployment Problems**: ปัญหาการ deploy
- **Network Issues**: ปัญหาเครือข่าย

## 🚀 ปัญหาการติดตั้ง (Installation Issues)

### 1. Node.js Version Compatibility

#### ปัญหา:
```bash
Error: The engine "node" is incompatible with this module
```

#### วิธีแก้:
```bash
# ตรวจสอบ Node.js version
node --version

# ติดตั้ง Node.js 20+
# macOS (ใช้ Homebrew)
brew install node@20

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows (ใช้ Chocolatey)
choco install nodejs --version=20.11.0
```

### 2. npm/yarn Installation Failures

#### ปัญหา:
```bash
npm ERR! peer dep missing
npm ERR! ERESOLVE unable to resolve dependency tree
```

#### วิธีแก้:
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# ติดตั้งใหม่
npm install

# หรือใช้ --legacy-peer-deps
npm install --legacy-peer-deps

# หรือใช้ yarn แทน
yarn install
```

### 3. Prisma Installation Issues

#### ปัญหา:
```bash
Error: Prisma schema file not found
Cannot find module '@prisma/client'
```

#### วิธีแก้:
```bash
# ติดตั้ง Prisma dependencies
npm install prisma @prisma/client

# Generate Prisma client
npx prisma generate

# ถ้ายังมีปัญหา ลอง reinstall
npm uninstall prisma @prisma/client
npm install prisma @prisma/client
npx prisma generate
```

### 4. PostgreSQL Connection Issues

#### ปัญหา:
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

#### วิธีแก้:
```bash
# ตรวจสอบ PostgreSQL status
sudo systemctl status postgresql

# เริ่ม PostgreSQL
sudo systemctl start postgresql

# ตรวจสอบ port
sudo netstat -tulpn | grep :5432

# ตรวจสอบ DATABASE_URL ใน .env
echo $DATABASE_URL

# ทดสอบ connection
psql $DATABASE_URL -c "SELECT version();"
```

## 🔐 ปัญหาระบบ Authentication

### 1. JWT Token Issues

#### ปัญหา: Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

#### วิธีแก้:
```bash
# ตรวจสอบ JWT_SECRET ใน .env
echo $JWT_SECRET

# ตรวจสอบ token format
# ใช้ jwt.io เพื่อ decode token

# ตรวจสอบ token expiration
# Token อาจหมดอายุแล้ว ให้ใช้ refresh token

# ตรวจสอบ Authorization header format
# ต้องเป็น: Authorization: Bearer <token>
```

#### Debug Script:
```javascript
// debug-jwt.js
const jwt = require('jsonwebtoken');

const token = 'your-token-here';
const secret = process.env.JWT_SECRET;

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.log('Token error:', error.message);
  
  // Try to decode without verification to see content
  const decoded = jwt.decode(token);
  console.log('Token content:', decoded);
}
```

### 2. Password Hashing Issues

#### ปัญหา: Password Verification Fails
```bash
# ตรวจสอบ Argon2 installation
npm list argon2

# ถ้าไม่มี ให้ติดตั้ง
npm install argon2

# ถ้ามีปัญหาใน compilation
npm rebuild argon2
```

#### Debug Script:
```javascript
// debug-password.js
const argon2 = require('argon2');

async function testPassword() {
  const password = 'test123';
  
  try {
    const hash = await argon2.hash(password);
    console.log('Hash:', hash);
    
    const isValid = await argon2.verify(hash, password);
    console.log('Verification:', isValid);
  } catch (error) {
    console.error('Argon2 error:', error);
  }
}

testPassword();
```

### 3. Session/Cookie Issues

#### ปัญหา: Session Not Persisting
```typescript
// ตรวจสอบ CORS configuration
const corsConfig = {
  origin: 'http://localhost:3000',
  credentials: true, // สำคัญสำหรับ cookies
};

// ตรวจสอบ cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
```

## 📁 ปัญหาการอัปโหลดไฟล์

### 1. File Upload Fails

#### ปัญหา: File Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

#### วิธีแก้:
```typescript
// ตรวจสอบ multer configuration
const multerConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // จำนวนไฟล์สูงสุด
  },
};

// ตรวจสอบ nginx configuration (ถ้าใช้)
// client_max_body_size 10M;
```

### 2. File Permission Issues

#### ปัญหา: Cannot Write to Upload Directory
```bash
Error: EACCES: permission denied, open '/app/uploads/file.jpg'
```

#### วิธีแก้:
```bash
# ตรวจสอบ permissions
ls -la uploads/

# แก้ไข permissions
chmod -R 755 uploads/
chown -R $USER:$USER uploads/

# สร้าง directory ถ้าไม่มี
mkdir -p uploads/{images,documents,videos,audio,thumbnails}
```

### 3. Supabase Storage Issues

#### ปัญหา: Supabase Upload Fails
```bash
Error: Invalid API key or insufficient permissions
```

#### วิธีแก้:
```bash
# ตรวจสอบ environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# ทดสอบ Supabase connection
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "$SUPABASE_URL/storage/v1/bucket"
```

#### Debug Script:
```javascript
// debug-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabase() {
  try {
    // Test bucket access
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Buckets:', data);
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testSupabase();
```

### 4. Image Processing Issues

#### ปัญหา: Sharp Library Errors
```bash
Error: Something went wrong installing the "sharp" module
```

#### วิธีแก้:
```bash
# Reinstall sharp
npm uninstall sharp
npm install sharp

# หรือใช้ platform-specific installation
npm install --platform=linux --arch=x64 sharp

# สำหรับ Docker
# ใน Dockerfile
RUN npm install sharp --platform=linux --arch=x64
```

## 🗄️ ปัญหา Database

### 1. Database Connection Pool Issues

#### ปัญหา: Too Many Connections
```bash
Error: remaining connection slots are reserved for non-replication superuser connections
```

#### วิธีแก้:
```sql
-- ตรวจสอบ active connections
SELECT count(*) FROM pg_stat_activity;

-- ตรวจสอบ max connections
SHOW max_connections;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < current_timestamp - INTERVAL '5 minutes';
```

```typescript
// ปรับ Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5',
    },
  },
});
```

### 2. Migration Issues

#### ปัญหา: Migration Fails
```bash
Error: Migration failed to apply cleanly to the shadow database
```

#### วิธีแก้:
```bash
# Reset migrations (development only)
npx prisma migrate reset

# Force apply migrations
npx prisma db push --force-reset

# Check migration status
npx prisma migrate status

# Resolve migration conflicts
npx prisma migrate resolve --applied "migration_name"
```

### 3. Slow Query Performance

#### ปัญหา: Database Queries Taking Too Long

#### วิธีแก้:
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_files_user_type ON files(uploaded_by_id, type);

-- Analyze table statistics
ANALYZE;
```

## 🚀 ปัญหาประสิทธิภาพ

### 1. High Memory Usage

#### ปัญหา: Application Using Too Much Memory

#### วิธีแก้:
```bash
# ตรวจสอบ memory usage
free -h
ps aux --sort=-%mem | head

# ใช้ Node.js memory profiling
node --inspect app.js

# ตั้งค่า Node.js memory limit
node --max-old-space-size=2048 app.js

# ใช้ PM2 memory monitoring
pm2 monit
```

#### Debug Script:
```javascript
// memory-monitor.js
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  console.log('---');
}, 5000);
```

### 2. High CPU Usage

#### ปัญหา: CPU Usage Consistently High

#### วิธีแก้:
```bash
# ตรวจสอบ CPU usage
htop
top -p $(pgrep node)

# ใช้ Node.js CPU profiling
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# ตรวจสอบ event loop lag
```

#### Debug Script:
```javascript
// cpu-monitor.js
const { performance } = require('perf_hooks');

setInterval(() => {
  const start = performance.now();
  setImmediate(() => {
    const lag = performance.now() - start;
    console.log(`Event loop lag: ${lag.toFixed(2)}ms`);
  });
}, 1000);
```

### 3. Slow API Response Times

#### ปัญหา: API Endpoints Responding Slowly

#### วิธีแก้:
```typescript
// Add response time logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
});

// Implement caching
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class AppModule {}

// Use database query optimization
async getUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      // Don't select unnecessary fields
    },
    take: 20, // Limit results
  });
}
```

## 🐳 ปัญหาการ Deploy

### 1. Docker Build Issues

#### ปัญหา: Docker Build Fails
```bash
Error: Cannot find module '@prisma/client'
```

#### วิธีแก้:
```dockerfile
# ใน Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

CMD ["npm", "run", "start:prod"]
```

### 2. Environment Variables Issues

#### ปัญหา: Environment Variables Not Loading

#### วิธีแก้:
```bash
# ตรวจสอบ .env file
cat .env

# ตรวจสอบ environment variables ใน container
docker exec -it container_name env

# ใน docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env
```

### 3. Port Binding Issues

#### ปัญหา: Port Already in Use
```bash
Error: listen EADDRINUSE :::4000
```

#### วิธีแก้:
```bash
# หา process ที่ใช้ port
lsof -i :4000
netstat -tulpn | grep :4000

# Kill process
kill -9 <PID>

# ใช้ port อื่น
PORT=4001 npm start

# ใน Docker
docker run -p 4001:4000 your-app
```

## 🌐 ปัญหาเครือข่าย

### 1. CORS Issues

#### ปัญหา: CORS Policy Blocking Requests
```bash
Access to fetch at 'http://localhost:4000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```

#### วิธีแก้:
```typescript
// ใน main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// หรือใช้ environment variable
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

### 2. SSL/TLS Issues

#### ปัญหา: SSL Certificate Errors
```bash
Error: unable to verify the first certificate
```

#### วิธีแก้:
```bash
# ใน development (ไม่แนะนำสำหรับ production)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start

# ติดตั้ง SSL certificate ที่ถูกต้อง
# ใช้ Let's Encrypt
sudo certbot --nginx -d yourdomain.com

# ตรวจสอบ SSL certificate
openssl s_client -connect yourdomain.com:443
```

### 3. Proxy Issues

#### ปัญหา: Reverse Proxy Configuration

#### วิธีแก้:
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for file uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

## 🔧 เครื่องมือ Debug

### 1. Logging และ Debugging

```typescript
// logger.service.ts
@Injectable()
export class LoggerService {
  private logger = new Logger(LoggerService.name);

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message, context);
    }
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, context);
  }

  log(message: string, context?: any) {
    this.logger.log(message, context);
  }
}

// ใช้ในการ debug
@Injectable()
export class AuthService {
  constructor(private logger: LoggerService) {}

  async login(loginDto: LoginDto) {
    this.logger.debug('Login attempt', { email: loginDto.email });
    
    try {
      // Login logic
      this.logger.log('Login successful', { email: loginDto.email });
    } catch (error) {
      this.logger.error('Login failed', error.stack, { email: loginDto.email });
      throw error;
    }
  }
}
```

### 2. Health Check Scripts

```bash
#!/bin/bash
# health-check.sh

echo "🏥 Running Health Checks..."

# Check if server is running
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

# Check database connection
if curl -f http://localhost:4000/health | grep -q "database.*up"; then
    echo "✅ Database is connected"
else
    echo "❌ Database connection failed"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 90 ]; then
    echo "✅ Disk space OK ($DISK_USAGE%)"
else
    echo "⚠️  Disk space warning ($DISK_USAGE%)"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -lt 85 ]; then
    echo "✅ Memory usage OK ($MEMORY_USAGE%)"
else
    echo "⚠️  Memory usage high ($MEMORY_USAGE%)"
fi

echo "🏥 Health check completed"
```

### 3. Performance Monitoring

```javascript
// performance-monitor.js
const express = require('express');
const app = express();

// Request timing middleware
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
});

// Memory usage monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  const memoryUsage = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
  };
  
  console.log('Memory Usage (MB):', memoryUsage);
  
  // Alert if memory usage is high
  if (memoryUsage.heapUsed > 500) {
    console.warn('⚠️  High memory usage detected:', memoryUsage.heapUsed, 'MB');
  }
}, 30000); // Every 30 seconds
```

## 📚 Best Practices สำหรับการแก้ไขปัญหา

### 1. Systematic Debugging Approach

```bash
# 1. Reproduce the issue
# 2. Check logs
tail -f logs/app.log

# 3. Check system resources
htop
df -h

# 4. Check network connectivity
ping google.com
curl -I http://localhost:4000/health

# 5. Check dependencies
npm list
docker ps

# 6. Test in isolation
# Create minimal test case
```

### 2. Documentation และ Logging

```typescript
// Always log important events
this.logger.log('User authenticated', { userId: user.id, email: user.email });
this.logger.error('Database connection failed', error.stack);
this.logger.warn('High memory usage detected', { usage: memoryUsage });

// Include context in error messages
throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);

// Use structured logging
this.logger.log('API request processed', {
  method: req.method,
  url: req.url,
  statusCode: res.statusCode,
  duration: `${duration}ms`,
  userId: req.user?.id,
});
```

### 3. Monitoring และ Alerting

```typescript
// Set up monitoring for critical metrics
const criticalMetrics = {
  responseTime: 1000, // ms
  errorRate: 0.05,    // 5%
  memoryUsage: 0.85,  // 85%
  diskUsage: 0.90,    // 90%
};

// Implement alerting
if (responseTime > criticalMetrics.responseTime) {
  await this.sendAlert('High response time detected', { responseTime });
}
```

## 🆘 การขอความช่วยเหลือ

### เมื่อไหร่ควรขอความช่วยเหลือ:
- ลองแก้ไขปัญหาตามคู่มือแล้วไม่สำเร็จ
- ปัญหาส่งผลกระทบต่อ production system
- ไม่แน่ใจว่าการแก้ไขจะปลอดภัย
- ต้องการ second opinion

### ข้อมูลที่ควรรวบรวมก่อนขอความช่วยเหลือ:
- Error messages และ stack traces
- System logs
- Environment configuration
- Steps to reproduce the issue
- System specifications
- Recent changes made

### ช่องทางการขอความช่วยเหลือ:
- GitHub Issues
- Community forums
- Technical documentation
- Stack Overflow
- Official support channels

## 🔗 Related Guides

- [Installation Guide](01-installation-guide.md) - การติดตั้งเบื้องต้น
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor ระบบ
- [Health Check Guide](07-health-check-guide.md) - การตรวจสอบสุขภาพระบบ
- [Security Guide](09-security-guide.md) - การแก้ไขปัญหาความปลอดภัย