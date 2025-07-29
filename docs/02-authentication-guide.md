# คู่มือระบบ Authentication

## 🔐 ภาพรวมระบบ Authentication

ระบบใช้ **JWT (JSON Web Token)** สำหรับการ authentication พร้อมกับ **Refresh Token** mechanism และ **Role-based Access Control (RBAC)**

### คุณสมบัติหลัก
- JWT Access Token (อายุสั้น)
- Refresh Token (อายุยาว)
- Role-based authorization (USER, ADMIN)
- Password hashing ด้วย Argon2
- Rate limiting
- Security middleware

## 🚀 การใช้งาน Authentication APIs

### 1. การสมัครสมาชิก (Register)

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

#### Response (Success - 201):
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-07-29T10:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

#### Response (Error - 409):
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### 2. การเข้าสู่ระบบ (Login)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response (Success - 200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### 3. การรีเฟรช Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (Success - 200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. การดูข้อมูลโปรไฟล์

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Response (Success - 200):
```json
{
  "id": "clxxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-07-29T10:00:00.000Z",
  "updatedAt": "2025-07-29T10:00:00.000Z"
}
```

### 5. การออกจากระบบ (Logout)

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Response (Success - 200):
```json
{
  "message": "Logged out successfully"
}
```

## 🔑 การใช้งาน Authorization

### การส่ง Token ใน Request

#### Header Authorization:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-based Access Control

#### User Roles:
- **USER**: ผู้ใช้ทั่วไป
- **ADMIN**: ผู้ดูแลระบบ

#### Protected Endpoints:
```typescript
// ต้องการ authentication
@UseGuards(JwtAuthGuard)

// ต้องการ ADMIN role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
```

## 🛡️ Security Features

### 1. Password Security
- **Hashing**: ใช้ Argon2 algorithm
- **Salt**: Random salt สำหรับแต่ละ password
- **Minimum Requirements**: ความยาวอย่างน้อย 6 ตัวอักษร

### 2. JWT Configuration
```env
JWT_SECRET="your-super-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
```

### 3. Rate Limiting
- **Global**: 100 requests ต่อนาที
- **Auth endpoints**: 10 requests ต่อนาที
- **IP-based**: จำกัดตาม IP address

### 4. Security Headers
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **XSS Protection**: Cross-site scripting protection

## 📱 การใช้งานใน Frontend

### JavaScript/TypeScript Example

```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        
        return data;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        
        return data;
      } else {
        this.logout();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Auto-refresh token if expired
      if (response.status === 401 && this.refreshToken) {
        await this.refreshAccessToken();
        headers.Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }

      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}

// การใช้งาน
const auth = new AuthService();

// Login
await auth.login('user@example.com', 'password123');

// API call with auto token refresh
const response = await auth.apiCall('/auth/profile');
const profile = await response.json();
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Token Expired
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Token expired"
}
```
**วิธีแก้**: ใช้ refresh token เพื่อขอ access token ใหม่

### 2. Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```
**วิธีแก้**: ตรวจสอบ token format และ JWT secret

### 3. Rate Limit Exceeded
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Rate limit exceeded"
}
```
**วิธีแก้**: รอสักครู่แล้วลองใหม่

### 4. Email Already Exists
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```
**วิธีแก้**: ใช้ email อื่นหรือทำการ login

## 🧪 การทดสอบ Authentication

### ใช้ Postman Collection
```bash
# Import postman-collection-fixed.json
# เริ่มจาก Authentication folder
# 1. Register User
# 2. Login User (tokens จะถูก save อัตโนมัติ)
# 3. Get Profile
# 4. Logout
```

### ใช้ cURL
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (ใส่ token ที่ได้จาก login)
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer <your-access-token>"
```

### ใช้ Test Scripts
```bash
# รัน authentication tests
npm run test:api:auth

# หรือใช้ shell script
./run-tests.sh auth
```

## 📚 Best Practices

### 1. Token Management
- เก็บ access token ใน memory
- เก็บ refresh token ใน secure storage
- ตั้งค่า auto-refresh mechanism
- Clear tokens เมื่อ logout

### 2. Error Handling
- จัดการ token expiration
- Retry mechanism สำหรับ network errors
- User-friendly error messages
- Logging สำหรับ debugging

### 3. Security
- ใช้ HTTPS ใน production
- Validate input data
- Implement proper CORS
- Monitor authentication attempts

## 🔗 Related Guides

- [API Testing Guide](06-api-testing-guide.md) - การทดสอบ Authentication APIs
- [Deployment Guide](05-deployment-guide.md) - การ deploy ระบบ authentication
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor authentication metrics