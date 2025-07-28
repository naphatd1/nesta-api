export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 20 * 1024 * 1024, // 20MB
    OTHER: 10 * 1024 * 1024, // 10MB
  },

  // Allowed file types
  ALLOWED_MIMETYPES: {
    IMAGE: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf',
    ],
    VIDEO: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ],
    AUDIO: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/webm',
    ],
  },

  // Upload paths
  UPLOAD_PATHS: {
    IMAGE: 'uploads/images',
    DOCUMENT: 'uploads/documents',
    VIDEO: 'uploads/videos',
    AUDIO: 'uploads/audio',
    THUMBNAIL: 'uploads/thumbnails',
    TEMP: 'uploads/temp',
  },

  // Image processing
  IMAGE_PROCESSING: {
    THUMBNAIL_SIZE: 300,
    QUALITY: 80,
    FORMATS: ['jpeg', 'png', 'webp'],
  },

  // Chunk upload settings
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  MAX_CHUNKS: 1000,
};

export const getFileTypeFromMimetype = (mimetype: string): string => {
  if (UPLOAD_CONFIG.ALLOWED_MIMETYPES.IMAGE.includes(mimetype)) {
    return 'IMAGE';
  }
  if (UPLOAD_CONFIG.ALLOWED_MIMETYPES.DOCUMENT.includes(mimetype)) {
    return 'DOCUMENT';
  }
  if (UPLOAD_CONFIG.ALLOWED_MIMETYPES.VIDEO.includes(mimetype)) {
    return 'VIDEO';
  }
  if (UPLOAD_CONFIG.ALLOWED_MIMETYPES.AUDIO.includes(mimetype)) {
    return 'AUDIO';
  }
  return 'OTHER';
};

export const getMaxFileSizeForType = (fileType: string): number => {
  return UPLOAD_CONFIG.MAX_FILE_SIZE[fileType as keyof typeof UPLOAD_CONFIG.MAX_FILE_SIZE] || UPLOAD_CONFIG.MAX_FILE_SIZE.OTHER;
};