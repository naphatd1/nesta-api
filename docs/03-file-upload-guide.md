# คู่มือระบบ File Upload

## 📁 ภาพรวมระบบ File Upload

ระบบรองรับการอัปโหลดไฟล์หลายประเภทพร้อมกับ **Hybrid Storage System** ที่สามารถใช้ทั้ง **Supabase Storage** และ **Local Storage**

### คุณสมบัติหลัก
- รองรับไฟล์หลายประเภท (Images, Documents, Videos, Audio)
- Hybrid storage (Supabase + Local fallback)
- Image processing และ thumbnail generation
- Chunk upload สำหรับไฟล์ขนาดใหญ่
- File metadata และ analytics
- Security validation

## 🎯 ประเภทไฟล์ที่รองรับ

### Images
- **JPEG/JPG**: image/jpeg
- **PNG**: image/png
- **GIF**: image/gif
- **WebP**: image/webp
- **SVG**: image/svg+xml
- **ขนาดสูงสุด**: 10MB

### Documents
- **PDF**: application/pdf
- **Word**: .doc, .docx
- **Excel**: .xls, .xlsx
- **PowerPoint**: .ppt, .pptx
- **Text**: .txt, .csv, .rtf
- **ขนาดสูงสุด**: 50MB

### Videos
- **MP4**: video/mp4
- **MPEG**: video/mpeg
- **QuickTime**: video/quicktime
- **AVI**: video/x-msvideo
- **WebM**: video/webm
- **ขนาดสูงสุด**: 100MB

### Audio
- **MP3**: audio/mpeg
- **WAV**: audio/wav
- **OGG**: audio/ogg
- **MP4 Audio**: audio/mp4
- **WebM Audio**: audio/webm
- **ขนาดสูงสุด**: 20MB

## 🚀 การใช้งาน File Upload APIs

### 1. อัปโหลดรูปภาพเดี่ยว

```http
POST /api/upload/images/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
- postId: <optional-post-id>
```

#### Response (Success - 201):
```json
{
  "id": "clxxxxx",
  "originalName": "photo.jpg",
  "filename": "uuid-generated-name.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "type": "IMAGE",
  "status": "COMPLETED",
  "url": "https://supabase-url/storage/v1/object/public/uploads/images/uuid.jpg",
  "createdAt": "2025-07-29T10:00:00.000Z"
}
```

### 2. อัปโหลดรูปภาพหลายไฟล์

```http
POST /api/upload/images/multiple
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- images: <file1>
- images: <file2>
- images: <file3>
- postId: <optional-post-id>
```

#### Response (Success - 201):
```json
[
  {
    "id": "clxxxxx1",
    "originalName": "photo1.jpg",
    "filename": "uuid1.jpg",
    "url": "https://...",
    "success": true
  },
  {
    "id": "clxxxxx2",
    "originalName": "photo2.jpg",
    "filename": "uuid2.jpg",
    "url": "https://...",
    "success": true
  }
]
```

### 3. อัปโหลดเอกสาร

```http
POST /api/upload/documents/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- document: <file>
- postId: <optional-post-id>
```

### 4. Chunk Upload (สำหรับไฟล์ขนาดใหญ่)

#### 4.1 เริ่มต้น Chunk Upload
```http
POST /api/upload/chunk/initiate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "filename": "large-video.mp4",
  "mimetype": "video/mp4",
  "size": 104857600,
  "postId": "optional-post-id"
}
```

#### 4.2 อัปโหลด Chunk
```http
POST /api/upload/chunk/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- chunk: <file-chunk>
- fileId: <file-id-from-initiate>
- chunkIndex: 0
- totalChunks: 100
```

#### 4.3 เสร็จสิ้น Chunk Upload
```http
POST /api/upload/chunk/complete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fileId": "<file-id>",
  "totalChunks": 100
}
```

## 📊 การจัดการไฟล์

### 1. ดูไฟล์ของตัวเอง

```http
GET /api/files/my-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <access_token>
```

#### Query Parameters:
- **type**: IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER
- **status**: UPLOADING, PROCESSING, COMPLETED, FAILED
- **page**: หมายเลขหน้า (default: 1)
- **limit**: จำนวนรายการต่อหน้า (default: 10)

#### Response:
```json
{
  "files": [
    {
      "id": "clxxxxx",
      "originalName": "photo.jpg",
      "filename": "uuid.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "type": "IMAGE",
      "status": "COMPLETED",
      "url": "https://...",
      "thumbnail": "https://...",
      "createdAt": "2025-07-29T10:00:00.000Z",
      "post": {
        "id": "post-id",
        "title": "Post Title"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 2. ดูสถิติไฟล์

```http
GET /api/files/stats
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "totalFiles": 150,
  "totalSize": 52428800,
  "breakdown": [
    {
      "type": "IMAGE",
      "status": "COMPLETED",
      "_count": { "id": 45 },
      "_sum": { "size": 15728640 }
    }
  ]
}
```

### 3. ดูรายละเอียดไฟล์

```http
GET /api/files/{fileId}/details
Authorization: Bearer <access_token>
```

### 4. ลบไฟล์

```http
DELETE /api/upload/images/{fileId}
Authorization: Bearer <access_token>
```

## 🌐 การเข้าถึงไฟล์

### 1. Serve ไฟล์โดยตรง

```http
GET /api/files/serve/images/{filename}
```

### 2. Serve Thumbnail

```http
GET /api/files/serve/thumbnails/thumb_{filename}
```

### 3. Download ไฟล์

```http
GET /api/files/download/{fileId}
Authorization: Bearer <access_token>
```

## ⚙️ การตั้งค่า Storage

### 1. Local Storage (Default)
ไฟล์จะถูกเก็บใน directory structure:
```
uploads/
├── images/
├── documents/
├── videos/
├── audio/
├── thumbnails/
└── temp/
```

### 2. Supabase Storage Configuration

#### ตั้งค่าใน .env:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

#### สร้าง Bucket ใน Supabase:
1. ไปที่ Supabase Dashboard > Storage
2. สร้าง bucket ชื่อ `uploads`
3. ตั้งค่าเป็น Public bucket

#### ตั้งค่า RLS Policies:
```sql
-- Allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Allow public access
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');
```

### 3. Hybrid Storage Behavior
- **Primary**: พยายามอัปโหลดไป Supabase Storage ก่อน
- **Fallback**: หากล้มเหลว จะใช้ Local Storage แทน
- **Automatic**: ระบบเลือกใช้ storage ที่เหมาะสมโดยอัตโนมัติ

## 🖼️ Image Processing

### Automatic Processing
- **Thumbnail Generation**: สร้าง thumbnail ขนาด 300x300px
- **Format Optimization**: แปลงเป็น JPEG quality 80%
- **Metadata Extraction**: ดึงข้อมูล width, height, format

### Manual Processing
```javascript
// ตัวอย่างการใช้งาน Sharp (ใน service)
await sharp(filePath)
  .resize(300, 300, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toFile(thumbnailPath);
```

## 📱 การใช้งานใน Frontend

### JavaScript Upload Example

```javascript
class FileUploadService {
  constructor(authService) {
    this.authService = authService;
    this.baseURL = 'http://localhost:4000/api';
  }

  async uploadImage(file, postId = null) {
    const formData = new FormData();
    formData.append('image', file);
    if (postId) {
      formData.append('postId', postId);
    }

    try {
      const response = await this.authService.apiCall('/upload/images/single', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files, postId = null) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    if (postId) {
      formData.append('postId', postId);
    }

    try {
      const response = await this.authService.apiCall('/upload/images/multiple', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getMyFiles(type = null, page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }

    try {
      const response = await this.authService.apiCall(`/files/my-files?${params}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Fetch files error:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const response = await this.authService.apiCall(`/upload/images/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

// การใช้งาน
const fileUpload = new FileUploadService(authService);

// Upload single image
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const result = await fileUpload.uploadImage(file);

// Upload multiple images
const files = Array.from(fileInput.files);
const results = await fileUpload.uploadMultipleImages(files);

// Get my files
const myFiles = await fileUpload.getMyFiles('IMAGE', 1, 20);
```

### React Upload Component Example

```jsx
import React, { useState } from 'react';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const result = JSON.parse(xhr.responseText);
          onUploadSuccess(result);
        }
        setUploading(false);
      });

      xhr.open('POST', '/api/upload/images/single');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <div>Uploading... {Math.round(progress)}%</div>
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
};
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. File Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```
**วิธีแก้**: ตรวจสอบขนาดไฟล์ตามประเภท

### 2. Invalid File Type
```json
{
  "statusCode": 400,
  "message": "Invalid file type",
  "error": "Bad Request"
}
```
**วิธีแก้**: ตรวจสอบ MIME type ที่รองรับ

### 3. Storage Error
```json
{
  "statusCode": 500,
  "message": "Storage error",
  "error": "Internal Server Error"
}
```
**วิธีแก้**: ตรวจสอบ Supabase configuration หรือ local storage permissions

### 4. Upload Timeout
**วิธีแก้**: ใช้ chunk upload สำหรับไฟล์ขนาดใหญ่

## 🧪 การทดสอบ File Upload

### ใช้ Postman
```bash
# Import postman-collection-fixed.json
# ไปที่ File Upload folder
# เลือกไฟล์ในช่อง form-data
# กด Send
```

### ใช้ cURL
```bash
# Upload image
curl -X POST http://localhost:4000/api/upload/images/single \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"

# Upload with postId
curl -X POST http://localhost:4000/api/upload/images/single \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg" \
  -F "postId=post-id-here"
```

### ใช้ Test Scripts
```bash
# รัน upload tests
npm run test:api:upload

# หรือใช้ shell script
./run-tests.sh upload
```

## 📊 Monitoring และ Analytics

### File Upload Metrics
- จำนวนไฟล์ที่อัปโหลดต่อวัน
- ขนาดไฟล์เฉลี่ย
- ประเภทไฟล์ที่นิยม
- Success/failure rates
- Storage usage

### ดู Metrics
```http
GET /api/monitoring/storage
Authorization: Bearer <access_token>
```

## 🔗 Related Guides

- [Authentication Guide](02-authentication-guide.md) - การ authenticate สำหรับ upload
- [API Testing Guide](06-api-testing-guide.md) - การทดสอบ upload APIs
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor file upload metrics