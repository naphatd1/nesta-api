# NestJS Authentication & File Upload API

A comprehensive NestJS API with authentication, authorization, file upload system, and monitoring tools.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (USER, ADMIN)
- Secure password hashing with Argon2
- Rate limiting and security middleware

### 📁 File Upload System
- Multi-format file support (Images, Documents, Videos, Audio)
- Hybrid storage: Supabase Storage + Local fallback
- Image processing with thumbnails
- Chunk upload for large files
- File metadata and analytics

### 📊 Monitoring & Analytics
- Real-time system metrics
- API performance monitoring
- Database statistics
- Storage analytics
- Health checks and alerting

### 🗄️ Database
- PostgreSQL with Prisma ORM
- Database migrations and seeding
- Optimized queries and relationships

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **File Storage**: Supabase Storage / Local Storage
- **Image Processing**: Sharp
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: Class Validator
- **Documentation**: Postman Collection

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn
- Docker (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd nest-auth-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_TOKEN_SECRET="your-refresh-token-secret"

# Application
PORT=4000
NODE_ENV=development

# Supabase (Optional - for cloud storage)
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. Start Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🐳 Docker Deployment

### Development
```bash
npm run docker:dev:up
```

### Production
```bash
npm run docker:prod:up
```

### Ubuntu Server Deployment
```bash
# Install Docker
./install-docker.sh

# Deploy application
./deploy.sh
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### File Upload Endpoints

#### Upload Single Image
```http
POST /api/upload/images/single
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

image: <file>
postId: <optional-post-id>
```

#### Upload Multiple Images
```http
POST /api/upload/images/multiple
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

images: <files>
postId: <optional-post-id>
```

#### Get My Images
```http
GET /api/upload/images/my-images
Authorization: Bearer <jwt-token>
```

### File Management Endpoints

#### Get My Files
```http
GET /api/files/my-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Get File Statistics
```http
GET /api/files/stats
Authorization: Bearer <jwt-token>
```

#### Get File Details
```http
GET /api/files/{fileId}/details
Authorization: Bearer <jwt-token>
```

### Monitoring Endpoints

#### System Dashboard
```http
GET /api/monitoring/dashboard
Authorization: Bearer <jwt-token>
```

#### Health Check
```http
GET /api/monitoring/health
Authorization: Bearer <jwt-token>
```

#### System Metrics
```http
GET /api/monitoring/system
Authorization: Bearer <jwt-token>
```

#### API Performance
```http
GET /api/monitoring/performance?period=1h
Authorization: Bearer <jwt-token>
```

## 🗂️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── controllers/      # Auth controllers
│   ├── services/         # Auth services
│   ├── guards/          # JWT guards
│   ├── strategies/      # Passport strategies
│   └── decorators/      # Custom decorators
├── users/               # User management
├── posts/               # Post management
├── upload/              # File upload system
│   ├── controllers/     # Upload controllers
│   ├── services/        # Upload services
│   ├── config/         # Upload configuration
│   └── dto/            # Data transfer objects
├── monitoring/          # Monitoring system
│   ├── controllers/     # Monitoring controllers
│   ├── services/        # Metrics services
│   └── interceptors/    # Metrics interceptor
├── health/              # Health check module
├── prisma/              # Database module
├── common/              # Shared utilities
│   ├── filters/         # Exception filters
│   ├── interceptors/    # Global interceptors
│   ├── middleware/      # Custom middleware
│   └── services/        # Shared services
└── main.ts              # Application entry point
```

## 🔧 Configuration

### Database Configuration
The application uses PostgreSQL with Prisma ORM. Configure your database connection in the `.env` file:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### File Storage Configuration
The application supports hybrid storage:

1. **Supabase Storage** (Primary)
2. **Local Storage** (Fallback)

Configure Supabase in `.env`:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Security Configuration
- JWT secrets should be strong and unique
- Rate limiting is configured for API protection
- CORS is enabled for specified origins
- Helmet provides security headers

## 📊 Monitoring Features

### System Metrics
- CPU and Memory usage
- Process information
- System uptime
- Platform details

### Database Metrics
- Connection status
- Table statistics
- Query performance
- Recent activity

### Storage Metrics
- Local storage usage
- Supabase storage stats
- File distribution
- Storage health

### API Metrics
- Request/response times
- Error rates
- Endpoint statistics
- Performance percentiles

### Health Checks
- Overall system health
- Service availability
- Resource usage alerts
- Automatic issue detection

## 🚨 Error Handling

The application includes comprehensive error handling:

- Global exception filters
- Validation error handling
- Security logging
- Error response formatting
- Alert system for critical issues

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: API request throttling
- **Security Headers**: Helmet middleware
- **Input Validation**: Class validator
- **CORS**: Cross-origin resource sharing
- **Password Security**: Argon2 hashing

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment Options

### 1. Traditional Server
- Ubuntu/CentOS server
- PM2 process manager
- Nginx reverse proxy
- SSL with Let's Encrypt

### 2. Docker Containers
- Multi-stage builds
- Production optimized
- Health checks included
- Volume persistence

### 3. Cloud Platforms
- Heroku ready
- AWS/GCP compatible
- Environment variables
- Database connections

## 🔧 Development Tools

### Scripts
```bash
npm run start:dev      # Development server
npm run start:debug    # Debug mode
npm run build          # Production build
npm run lint           # Code linting
npm run format         # Code formatting
```

### Docker Scripts
```bash
npm run docker:dev     # Development container
npm run docker:prod    # Production container
npm run docker:build   # Build images
```

## 📈 Performance Optimization

- **Database**: Optimized queries with Prisma
- **Caching**: Redis integration ready
- **File Processing**: Async image processing
- **Compression**: Gzip compression enabled
- **CDN**: Supabase Storage CDN
- **Monitoring**: Real-time performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Postman collection
- Check the monitoring dashboard

## 🔄 Updates & Maintenance

- Regular security updates
- Database migrations
- Performance monitoring
- Log rotation
- Backup strategies

---

**Built with ❤️ using NestJS**