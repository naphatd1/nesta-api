# คู่มือการทดสอบ API

## 🧪 ภาพรวมการทดสอบ API

คู่มือนี้ครอบคลุมวิธีการทดสอบ API ทุกส่วนของระบบ ตั้งแต่ manual testing จนถึง automated testing

### เครื่องมือทดสอบที่รองรับ
- **Postman**: GUI testing tool
- **Newman**: Command-line Postman runner
- **cURL**: Command-line HTTP client
- **Custom Test Scripts**: JavaScript test runners
- **Jest**: Unit และ integration testing

## 📋 การเตรียมความพร้อม

### 1. เริ่มต้น Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Docker mode
npm run docker:dev:up
```

### 2. ตรวจสอบ Server Status
```bash
# ใช้ built-in script
npm run check:server

# หรือใช้ curl
curl http://localhost:4000/health
```

### 3. Import Postman Collection
```bash
# ไฟล์ที่ต้องใช้
- postman-collection-fixed.json (Collection หลัก)
- postman-environment.json (Environment variables)
```

## 🔐 การทดสอบ Authentication

### 1. Manual Testing ด้วย Postman

#### 1.1 Register User
```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "USER"
}
```

#### 1.2 Login User
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 1.3 Get Profile
```http
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{accessToken}}
```

### 2. Automated Testing

#### 2.1 ใช้ Newman
```bash
# รัน authentication tests
npm run test:api:auth

# หรือใช้ newman โดยตรง
newman run postman-collection-fixed.json \
  -e postman-environment.json \
  --folder "Authentication"
```

#### 2.2 ใช้ cURL Scripts
```bash
#!/bin/bash
# test-auth.sh

BASE_URL="http://localhost:4000/api"

echo "Testing Authentication..."

# Register
echo "1. Testing Register..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Login
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# Get Profile
echo "3. Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"
```

### 3. Test Cases

#### 3.1 Positive Test Cases
- ✅ Register with valid data
- ✅ Login with correct credentials
- ✅ Access protected routes with valid token
- ✅ Refresh token successfully
- ✅ Logout successfully

#### 3.2 Negative Test Cases
- ❌ Register with existing email
- ❌ Login with wrong password
- ❌ Access protected routes without token
- ❌ Use expired token
- ❌ Use invalid token format

## 📁 การทดสอบ File Upload

### 1. Manual Testing ด้วย Postman

#### 1.1 Upload Single Image
```http
POST {{baseUrl}}/api/upload/images/single
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

Form Data:
- image: [select file]
- postId: optional-post-id
```

#### 1.2 Upload Multiple Images
```http
POST {{baseUrl}}/api/upload/images/multiple
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

Form Data:
- images: [select file 1]
- images: [select file 2]
- images: [select file 3]
```

### 2. Automated Testing

#### 2.1 ใช้ Newman
```bash
# รัน upload tests
npm run test:api:upload

# หรือใช้ shell script
./run-tests.sh upload
```

#### 2.2 ใช้ cURL
```bash
#!/bin/bash
# test-upload.sh

BASE_URL="http://localhost:4000/api"
TOKEN="your-access-token"

# Create test image
echo "Creating test image..."
convert -size 100x100 xc:red test-image.jpg

# Upload single image
echo "Testing single image upload..."
curl -X POST "$BASE_URL/upload/images/single" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg"

# Upload multiple images
echo "Testing multiple image upload..."
curl -X POST "$BASE_URL/upload/images/multiple" \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@test-image.jpg" \
  -F "images=@test-image.jpg"

# Clean up
rm test-image.jpg
```

### 3. Test Cases

#### 3.1 Image Upload Tests
- ✅ Upload valid JPEG image
- ✅ Upload valid PNG image
- ✅ Upload multiple images
- ❌ Upload file too large
- ❌ Upload invalid file type
- ❌ Upload without authentication

#### 3.2 Document Upload Tests
- ✅ Upload PDF document
- ✅ Upload Word document
- ❌ Upload executable file
- ❌ Upload malicious file

## 📊 การทดสอบ Monitoring

### 1. Manual Testing

#### 1.1 Dashboard
```http
GET {{baseUrl}}/api/monitoring/dashboard
Authorization: Bearer {{accessToken}}
```

#### 1.2 System Metrics
```http
GET {{baseUrl}}/api/monitoring/system
Authorization: Bearer {{accessToken}}
```

#### 1.3 Performance Metrics
```http
GET {{baseUrl}}/api/monitoring/performance?period=1h
Authorization: Bearer {{accessToken}}
```

### 2. Automated Testing

```bash
# รัน monitoring tests
npm run test:api:monitoring

# ทดสอบ specific metrics
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/monitoring/system" | jq '.cpu.usage'
```

### 3. Test Cases

#### 3.1 Monitoring Tests
- ✅ Get dashboard data
- ✅ Get system metrics
- ✅ Get database stats
- ✅ Get storage analytics
- ❌ Access without admin role

## 🏥 การทดสอบ Health Check

### 1. Basic Health Check
```bash
# Simple health check
curl http://localhost:4000/health

# Expected response
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "storage": { "status": "up" }
  }
}
```

### 2. Detailed Health Check
```bash
# Detailed health check
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/monitoring/health
```

### 3. Automated Health Testing
```bash
# รัน health tests
npm run test:api:health

# ใช้ script
./run-tests.sh health
```

## 🔄 Integration Testing

### 1. End-to-End Test Flow

```javascript
// e2e-test.js
const axios = require('axios');

class E2ETest {
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
    this.token = null;
    this.userId = null;
  }

  async runFullTest() {
    try {
      console.log('🧪 Starting E2E Test...');
      
      // 1. Register user
      await this.testRegister();
      
      // 2. Login user
      await this.testLogin();
      
      // 3. Upload file
      await this.testFileUpload();
      
      // 4. Get user files
      await this.testGetFiles();
      
      // 5. Check monitoring
      await this.testMonitoring();
      
      console.log('✅ All E2E tests passed!');
    } catch (error) {
      console.error('❌ E2E test failed:', error.message);
      process.exit(1);
    }
  }

  async testRegister() {
    const response = await axios.post(`${this.baseURL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'E2E Test User'
    });
    
    console.log('✅ Register test passed');
    return response.data;
  }

  async testLogin() {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email: this.email,
      password: 'password123'
    });
    
    this.token = response.data.accessToken;
    this.userId = response.data.user.id;
    console.log('✅ Login test passed');
  }

  async testFileUpload() {
    const FormData = require('form-data');
    const fs = require('fs');
    
    // Create test file
    fs.writeFileSync('test.txt', 'Test file content');
    
    const form = new FormData();
    form.append('document', fs.createReadStream('test.txt'));
    
    const response = await axios.post(
      `${this.baseURL}/upload/documents/single`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    
    // Clean up
    fs.unlinkSync('test.txt');
    
    console.log('✅ File upload test passed');
    return response.data;
  }

  async testGetFiles() {
    const response = await axios.get(`${this.baseURL}/files/my-files`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    console.log('✅ Get files test passed');
    return response.data;
  }

  async testMonitoring() {
    const response = await axios.get(`${this.baseURL}/monitoring/dashboard`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    console.log('✅ Monitoring test passed');
    return response.data;
  }
}

// Run test
const test = new E2ETest();
test.runFullTest();
```

### 2. การรัน Integration Tests
```bash
# รัน E2E test
node e2e-test.js

# รัน full test suite
npm run test:full

# รัน specific test group
npm run test:auth:full
npm run test:upload:full
```

## 🚀 Performance Testing

### 1. Load Testing ด้วย Artillery

#### artillery.yml
```yaml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
  variables:
    baseUrl: 'http://localhost:4000/api'

scenarios:
  - name: 'Authentication Flow'
    weight: 50
    flow:
      - post:
          url: '/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
          capture:
            - json: '$.accessToken'
              as: 'token'
      - get:
          url: '/auth/profile'
          headers:
            Authorization: 'Bearer {{ token }}'

  - name: 'File Upload'
    weight: 30
    flow:
      - post:
          url: '/upload/images/single'
          headers:
            Authorization: 'Bearer {{ token }}'
          formData:
            image: '@test-image.jpg'

  - name: 'Monitoring'
    weight: 20
    flow:
      - get:
          url: '/monitoring/dashboard'
          headers:
            Authorization: 'Bearer {{ token }}'
```

#### การรัน Load Test
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery.yml

# Quick load test
artillery quick --duration 60 --rate 10 http://localhost:4000/health
```

### 2. Stress Testing

```bash
# ใช้ Apache Bench
ab -n 1000 -c 50 http://localhost:4000/health

# ใช้ wrk
wrk -t12 -c400 -d30s http://localhost:4000/health
```

## 📝 Test Reporting

### 1. Newman HTML Reporter

```bash
# Install HTML reporter
npm install -g newman-reporter-html

# Run with HTML report
newman run postman-collection-fixed.json \
  -e postman-environment.json \
  -r html \
  --reporter-html-export test-report.html
```

### 2. Custom Test Reporter

```javascript
// test-reporter.js
class TestReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addResult(testName, status, duration, error = null) {
    this.results.push({
      name: testName,
      status,
      duration,
      error,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = totalTests - passedTests;
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        duration: totalDuration,
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    return report;
  }

  saveReport(filename = 'test-report.json') {
    const fs = require('fs');
    const report = this.generateReport();
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📊 Test report saved to ${filename}`);
  }
}

module.exports = TestReporter;
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Server Not Running
```bash
# ตรวจสอบ process
ps aux | grep node

# ตรวจสอบ port
lsof -i :4000

# เริ่ม server
npm run start:dev
```

### 2. Authentication Failures
```bash
# ตรวจสอบ JWT secret
echo $JWT_SECRET

# ตรวจสอบ token expiration
# ใช้ jwt.io เพื่อ decode token
```

### 3. File Upload Failures
```bash
# ตรวจสอบ uploads directory
ls -la uploads/

# ตรวจสอบ permissions
chmod -R 755 uploads/
```

### 4. Database Connection Issues
```bash
# ตรวจสอบ PostgreSQL
sudo systemctl status postgresql

# ทดสอบ connection
psql $DATABASE_URL
```

## 📊 Test Automation

### 1. GitHub Actions

#### .github/workflows/test.yml
```yaml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test database
      run: |
        npx prisma migrate deploy
        npx prisma db seed
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
    
    - name: Start application
      run: npm run start:dev &
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
    
    - name: Wait for server
      run: npm run wait:server
    
    - name: Run API tests
      run: npm run test:api
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results.json
```

### 2. Continuous Testing

```bash
# Watch mode สำหรับ development
npm run test:watch

# Pre-commit hook
# ใน .git/hooks/pre-commit
#!/bin/sh
npm run test:api || exit 1
```

## 📚 Best Practices

### 1. Test Organization
- แยก test cases ตาม module
- ใช้ descriptive test names
- Group related tests together
- Maintain test data consistency

### 2. Test Data Management
- ใช้ test database แยกต่างหาก
- Clean up test data หลังจากรัน test
- ใช้ fixtures สำหรับ test data
- Mock external services

### 3. Error Handling
- Test both success และ error scenarios
- Validate error messages
- Check HTTP status codes
- Test edge cases

### 4. Performance Testing
- Set realistic load targets
- Monitor resource usage
- Test under different conditions
- Document performance baselines

## 🔗 Related Guides

- [Authentication Guide](02-authentication-guide.md) - รายละเอียด Authentication APIs
- [File Upload Guide](03-file-upload-guide.md) - รายละเอียด Upload APIs
- [Monitoring Guide](04-monitoring-guide.md) - รายละเอียด Monitoring APIs
- [Health Check Guide](07-health-check-guide.md) - รายละเอียด Health Check APIs