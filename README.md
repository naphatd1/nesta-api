# NestJS Authentication API

A complete NestJS API with authentication, authorization, and CRUD operations.

## Features

- 🔐 **Authentication**: Register, Login, Logout with JWT
- 👥 **User Management**: User and Admin roles
- 📝 **Posts System**: CRUD operations with ownership
- 🛡️ **Security**: Argon2 password hashing, Rate limiting, Helmet
- 🔒 **Authorization**: Role-based access control
- 📊 **Database**: PostgreSQL with Prisma ORM

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Update .env with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/nestauth"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:4000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user (invalidates refresh token)
- `POST /api/auth/create-admin` - Create admin user (Admin only)

### Users (Protected)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/activate` - Activate user (Admin only)
- `PATCH /api/users/:id/deactivate` - Deactivate user (Admin only)

### Posts (Protected)
- `GET /api/posts` - Get all posts
- `GET /api/posts/my-posts` - Get current user's posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

## Example Usage

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### Create Post (with JWT token)
```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post",
    "published": true
  }'
```

## Security Features

- **Password Hashing**: Argon2 for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers protection
- **Input Validation**: Automatic request validation with class-validator
- **Role-based Access**: USER and ADMIN roles with different permissions

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nestauth"
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
PORT=4000
```

## Development

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm run test
npm run test:e2e
```