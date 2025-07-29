export const uploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  uploadPath: process.env.UPLOAD_PATH || './storage/uploads',
  
  // File size limits (in bytes)
  maxFileSizes: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 20 * 1024 * 1024, // 20MB
    OTHER: 10 * 1024 * 1024, // 10MB
  },
  
  // Upload paths
  uploadPaths: {
    IMAGE: 'storage/uploads/images',
    DOCUMENT: 'storage/uploads/documents',
    VIDEO: 'storage/uploads/videos',
    AUDIO: 'storage/uploads/audio',
    THUMBNAIL: 'storage/uploads/thumbnails',
    TEMP: 'storage/uploads/temp',
  },
};