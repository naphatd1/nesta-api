# API สำหรับดูไฟล์ที่อัปโหลด

## 1. ดูรูปภาพของผู้ใช้
```
GET /api/upload/images/my-images
Authorization: Bearer JWT_TOKEN
```

## 2. ดูรูปภาพของ Post
```
GET /api/upload/images/post/{postId}
Authorization: Bearer JWT_TOKEN
```

## 3. ดูไฟล์ที่อัปโหลด
```
GET /api/files/serve/{folder}/{filename}
```

## 4. ลบไฟล์
```
DELETE /api/upload/images/{fileId}
Authorization: Bearer JWT_TOKEN
```

## ตัวอย่าง Response:
```json
{
  "id": "clxxxxx",
  "originalName": "photo.jpg",
  "filename": "uuid-generated-name.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "type": "IMAGE",
  "status": "COMPLETED",
  "url": "/api/files/serve/images/uuid-generated-name.jpg",
  "thumbnail": "/api/files/serve/thumbnails/thumb_uuid-generated-name.jpg",
  "createdAt": "2025-07-29T08:00:00.000Z",
  "post": {
    "id": "post-id",
    "title": "Post Title"
  }
}
```