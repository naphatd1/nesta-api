import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageUploadController } from './controllers/image-upload.controller';
import { DocumentUploadController } from './controllers/document-upload.controller';
import { ChunkUploadController } from './controllers/chunk-upload.controller';
import { FileServeController } from './controllers/file-serve.controller';
import { FileManagementController } from './controllers/file-management.controller';
import { ImageUploadService } from './services/image-upload.service';
import { DocumentUploadService } from './services/document-upload.service';
import { ChunkUploadService } from './services/chunk-upload.service';
import { FileProcessingService } from './services/file-processing.service';
import { UPLOAD_CONFIG } from './config/upload.config';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      // Use memory storage to get file.buffer
      storage: memoryStorage(),
      limits: {
        fileSize: Math.max(...Object.values(UPLOAD_CONFIG.MAX_FILE_SIZE)),
      },
      fileFilter: (req, file, cb) => {
        // Basic validation - more specific validation in services
        const allowedTypes = [
          ...UPLOAD_CONFIG.ALLOWED_MIMETYPES.IMAGE,
          ...UPLOAD_CONFIG.ALLOWED_MIMETYPES.DOCUMENT,
          ...UPLOAD_CONFIG.ALLOWED_MIMETYPES.VIDEO,
          ...UPLOAD_CONFIG.ALLOWED_MIMETYPES.AUDIO,
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  ],
  controllers: [
    ImageUploadController,
    DocumentUploadController,
    ChunkUploadController,
    FileServeController,
    FileManagementController,
  ],
  providers: [
    ImageUploadService,
    DocumentUploadService,
    ChunkUploadService,
    FileProcessingService,
  ],
  exports: [
    ImageUploadService,
    DocumentUploadService,
    ChunkUploadService,
    FileProcessingService,
  ],
})
export class UploadModule {}