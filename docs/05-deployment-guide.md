# คู่มือการ Deploy ระบบ

## 🚀 ภาพรวมการ Deployment

คู่มือนี้ครอบคลุมการ deploy ระบบในสภาพแวดล้อมต่างๆ ตั้งแต่ development จนถึง production

### วิธีการ Deploy ที่รองรับ
- **Local Development**: สำหรับการพัฒนา
- **Docker Containers**: แนะนำสำหรับ production
- **Traditional Server**: Ubuntu/CentOS server
- **Cloud Platforms**: AWS, GCP, Heroku

## 🐳 Docker Deployment (แนะนำ)

### 1. Development Environment

#### docker-compose.dev.yml
```bash
# เริ่มต้น development environment
npm run docker:dev:up

# หยุด development environment
npm run docker:dev:down

# ดู logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### คุณสมบัติ Development:
- Hot reload enabled
- Debug mode
- Volume mounting สำหรับ source code
- Development database

### 2. Production Environment

#### docker-compose.yml
```bash
# เริ่มต้น production environment
npm run docker:prod:up

# หยุด production environment
npm run docker:prod:down

# ดู status
docker-compose ps
```

#### คุณสมบัติ Production:
- Optimized build
- Health checks
- Restart policies
- Production database
- Redis caching
- Nginx reverse proxy (ถ้าต้องการ)

### 3. การตั้งค่า Environment Variables

#### สร้างไฟล์ .env.production:
```env
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL="postgresql://username:password@postgres:5432/nestdb?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secure-production-jwt-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET="your-super-secure-refresh-token-secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Supabase (Optional)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-production-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

### 4. Docker Build Process

#### Multi-stage Dockerfile:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

#### การ Build Image:
```bash
# Build production image
docker build -t nest-auth-api:latest .

# Build with specific tag
docker build -t nest-auth-api:v1.0.0 .

# Build for different platforms
docker buildx build --platform linux/amd64,linux/arm64 -t nest-auth-api:latest .
```

## 🖥️ Traditional Server Deployment

### 1. Ubuntu Server Setup

#### ติดตั้ง Dependencies:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Optional)
sudo apt install nginx -y
```

#### ตั้งค่า Database:
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE nestdb;
CREATE USER nestuser WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE nestdb TO nestuser;
\q
```

### 2. Application Deployment

#### Clone และ Setup:
```bash
# Clone repository
git clone <your-repository-url>
cd nest-auth-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build
```

#### PM2 Configuration:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nest-auth-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### เริ่มต้นด้วย PM2:
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Monitor
pm2 monit
```

### 3. Nginx Configuration (Optional)

#### /etc/nginx/sites-available/nest-auth-api:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
    }

    # Static files
    location /uploads {
        alias /path/to/your/app/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### เปิดใช้งาน Nginx:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nest-auth-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Platform Deployment

### 1. Heroku Deployment

#### Heroku Configuration:
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Procfile:
```
web: npm run start:prod
release: npx prisma migrate deploy
```

### 2. AWS Deployment

#### EC2 Instance:
```bash
# Launch EC2 instance (Ubuntu 22.04)
# Security Group: Allow HTTP (80), HTTPS (443), SSH (22), Custom (4000)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow traditional server setup steps
```

#### RDS Database:
```bash
# Create RDS PostgreSQL instance
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/nestdb"
```

#### S3 Storage (Alternative to Supabase):
```bash
# Install AWS SDK
npm install @aws-sdk/client-s3

# Configure AWS credentials
aws configure
```

### 3. Google Cloud Platform

#### Cloud Run Deployment:
```bash
# Install gcloud CLI
# Authenticate
gcloud auth login

# Set project
gcloud config set project your-project-id

# Build and deploy
gcloud run deploy nest-auth-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Cloud SQL:
```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create nest-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create nestdb --instance=nest-postgres
```

## 🔧 Automated Deployment

### 1. GitHub Actions

#### .github/workflows/deploy.yml:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/your/app
          git pull origin main
          npm install
          npm run build
          npx prisma migrate deploy
          pm2 restart nest-auth-api
```

### 2. Deploy Script

#### deploy.sh:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart application
pm2 restart nest-auth-api

# Health check
sleep 5
curl -f http://localhost:4000/health || exit 1

echo "✅ Deployment completed successfully!"
```

#### การใช้งาน:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📊 Monitoring และ Logging

### 1. Application Monitoring

#### PM2 Monitoring:
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart nest-auth-api

# Reload app (zero downtime)
pm2 reload nest-auth-api
```

### 2. System Monitoring

#### Install monitoring tools:
```bash
# Install htop
sudo apt install htop

# Install netstat
sudo apt install net-tools

# Monitor system resources
htop

# Check port usage
netstat -tulpn | grep :4000
```

### 3. Log Management

#### Logrotate configuration:
```bash
# /etc/logrotate.d/nest-auth-api
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔒 Security Considerations

### 1. Environment Security
```bash
# Set proper file permissions
chmod 600 .env
chown ubuntu:ubuntu .env

# Secure uploads directory
chmod 755 uploads/
chown -R ubuntu:ubuntu uploads/
```

### 2. Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Allow application port (if needed)
sudo ufw allow 4000

# Check status
sudo ufw status
```

### 3. Database Security
```bash
# PostgreSQL security
sudo -u postgres psql

# Change default passwords
ALTER USER postgres PASSWORD 'new_secure_password';

# Restrict connections
# Edit /etc/postgresql/15/main/pg_hba.conf
# Edit /etc/postgresql/15/main/postgresql.conf
```

## 🧪 Deployment Testing

### 1. Health Checks
```bash
# Basic health check
curl http://localhost:4000/health

# Detailed health check
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/monitoring/health
```

### 2. Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Basic load test
ab -n 1000 -c 10 http://localhost:4000/health

# API load test
ab -n 100 -c 5 -H "Authorization: Bearer <token>" http://localhost:4000/api/auth/profile
```

### 3. Integration Testing
```bash
# Run full test suite
npm run test:api

# Test specific endpoints
npm run test:api:auth
npm run test:api:upload
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Application Won't Start
```bash
# Check logs
pm2 logs nest-auth-api

# Check port availability
lsof -i :4000

# Check environment variables
pm2 env 0
```

### 2. Database Connection Issues
```bash
# Test database connection
psql -h localhost -U nestuser -d nestdb

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. File Upload Issues
```bash
# Check uploads directory permissions
ls -la uploads/

# Fix permissions
chmod -R 755 uploads/
chown -R ubuntu:ubuntu uploads/
```

### 4. Memory Issues
```bash
# Check memory usage
free -h

# Check application memory
pm2 monit

# Restart application
pm2 restart nest-auth-api
```

## 📚 Best Practices

### 1. Deployment Strategy
- Use blue-green deployment
- Implement health checks
- Monitor application metrics
- Have rollback plan

### 2. Security
- Use environment variables for secrets
- Enable HTTPS in production
- Regular security updates
- Monitor for vulnerabilities

### 3. Performance
- Enable gzip compression
- Use CDN for static assets
- Implement caching
- Monitor response times

### 4. Backup Strategy
- Regular database backups
- File system backups
- Test restore procedures
- Document recovery process

## 🔗 Related Guides

- [Installation Guide](01-installation-guide.md) - การติดตั้งเบื้องต้น
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor production system
- [Health Check Guide](07-health-check-guide.md) - การตรวจสอบสุขภาพระบบ