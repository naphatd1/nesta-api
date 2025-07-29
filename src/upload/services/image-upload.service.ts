import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileType, FileStatus } from '@prisma/client';
import { UPLOAD_CONFIG, getFileTypeFromMimetype } from '../config/upload.config';
import { FileProcessingService } from './file-processing.service';
import { SupabaseStorageService } from './supabase-storage.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    postId?: string,
  ): Promise<any> {
    console.log('Upload params:', { userId, postId, hasFile: !!file });
    
    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_MIMETYPES.IMAGE.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image file type');
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE) {
      throw new BadRequestException('Image file too large');
    }

    // Skip postId validation for now - allow any postId or null
    // TODO: Add postId validation if needed

    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      let filePath: string;
      let fileUrl: string;
      let metadata: any = {};

      // Try Supabase Storage first, fallback to local storage
      let useSupabase = false;
      
      if (this.supabaseStorage.isEnabled()) {
        try {
          // Upload to Supabase Storage
          const bucketName = 'uploads';
          const supabasePath = `images/${uniqueFilename}`;
          
          // Try to ensure bucket exists (ignore errors)
          try {
            await this.supabaseStorage.createBucket(bucketName);
          } catch (error) {
            this.logger.warn('Bucket creation failed, assuming it exists:', error.message);
          }
          
          // Upload file
          const uploadResult = await this.supabaseStorage.uploadFile(
            bucketName,
            supabasePath,
            file.buffer,
            {
              contentType: file.mimetype,
              cacheControl: '3600',
            }
          );
          
          filePath = uploadResult.path;
          fileUrl = uploadResult.url;
          useSupabase = true;
          
          // Get basic metadata
          metadata = {
            size: file.size,
            mimetype: file.mimetype,
            storage: 'supabase',
            bucket: bucketName,
          };
          
          this.logger.log(`✅ File uploaded to Supabase: ${fileUrl}`);
        } catch (error) {
          this.logger.error(`❌ Supabase upload failed: ${error.message}`);
          this.logger.log('🔄 Falling back to local storage...');
          useSupabase = false;
        }
      }
      
      if (!useSupabase) {
        // Fallback to local storage
        const uploadDir = UPLOAD_CONFIG.UPLOAD_PATHS.IMAGE;
        await this.ensureDirectoryExists(uploadDir);
        
        filePath = path.join(uploadDir, uniqueFilename);
        await fs.writeFile(filePath, file.buffer);
        
        fileUrl = `/api/files/serve/images/${uniqueFilename}`;
        
        // Get file metadata
        metadata = await this.fileProcessingService.getFileMetadata(
          filePath,
          file.mimetype,
        );
        
        metadata.storage = 'local';
        this.logger.log(`💾 File uploaded locally: ${filePath}`);
      }

      // Save file record to database
      const fileRecord = await this.prisma.file.create({
        data: {
          originalName: file.originalname,
          filename: uniqueFilename,
          mimetype: file.mimetype,
          size: file.size,
          type: FileType.IMAGE,
          status: FileStatus.COMPLETED, // Set to completed for Supabase uploads
          path: filePath,
          url: fileUrl,
          metadata,
          uploadedById: userId,
          postId: postId || null,
        },
      });

      // Process file asynchronously (only for local storage)
      if (!this.supabaseStorage.isEnabled()) {
        this.fileProcessingService.processFile(fileRecord.id).catch((error) => {
          this.logger.error('Failed to process image:', error);
        });
      }

      return {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        type: fileRecord.type,
        status: fileRecord.status,
        url: fileRecord.url,
        createdAt: fileRecord.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to upload image:', error);
      console.error('Detailed upload error:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    userId: string,
    postId?: string,
  ): Promise<any[]> {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, userId, postId);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to upload image ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false,
        });
      }
    }

    return results;
  }

  async getImagesByUser(userId: string): Promise<any[]> {
    const images = await this.prisma.file.findMany({
      where: {
        uploadedById: userId,
        type: FileType.IMAGE,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        originalName: true,
        filename: true,
        mimetype: true,
        size: true,
        type: true,
        status: true,
        url: true,
        thumbnail: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return images;
  }

  async getImagesByPost(postId: string): Promise<any[]> {
    const images = await this.prisma.file.findMany({
      where: {
        postId,
        type: FileType.IMAGE,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        originalName: true,
        filename: true,
        mimetype: true,
        size: true,
        type: true,
        status: true,
        url: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return images;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}