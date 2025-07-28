import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageUploadController } from './controllers/image-upload.controller';
import { DocumentUploadController } from './controllers/document-upload.controller';
import { ChunkUploadController } from './controllers/chunk-upload.controller';
import { FileServeController } from './controllers/file-serve.controller';
import { ImageUploadService } from './services/image-upload.service';
import { DocumentUploadService } from './services/document-upload.service';
import { ChunkUploadService } from './services/chunk-upload.service';
import { FileProcessingService } from './services/file-processing.service';
import { UPLOAD_CONFIG } from './config/upload.config';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // This will be overridden by individual services
          cb(null, UPLOAD_CONFIG.UPLOAD_PATHS.TEMP);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
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