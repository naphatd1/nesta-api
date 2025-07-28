import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileType, FileStatus } from '@prisma/client';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UPLOAD_CONFIG } from '../config/upload.config';

@Injectable()
export class FileProcessingService {
  private readonly logger = new Logger(FileProcessingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processFile(fileId: string): Promise<void> {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Update status to processing
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.PROCESSING },
      });

      let thumbnailPath: string | undefined;
      let url: string;

      // Process based on file type
      switch (file.type) {
        case FileType.IMAGE:
          thumbnailPath = await this.processImage(file.path, file.filename);
          url = this.generatePublicUrl(file.path);
          break;
        case FileType.DOCUMENT:
          url = this.generatePublicUrl(file.path);
          // Could add document preview generation here
          break;
        case FileType.VIDEO:
          url = this.generatePublicUrl(file.path);
          // Could add video thumbnail generation here
          break;
        case FileType.AUDIO:
          url = this.generatePublicUrl(file.path);
          // Could add audio waveform generation here
          break;
        default:
          url = this.generatePublicUrl(file.path);
      }

      // Update file with processed information
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: FileStatus.COMPLETED,
          url,
          thumbnail: thumbnailPath ? this.generatePublicUrl(thumbnailPath) : undefined,
        },
      });

      this.logger.log(`File processed successfully: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to process file ${fileId}:`, error);
      
      // Update status to failed
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.FAILED },
      });
    }
  }

  private async processImage(filePath: string, filename: string): Promise<string> {
    try {
      const thumbnailDir = UPLOAD_CONFIG.UPLOAD_PATHS.THUMBNAIL;
      await this.ensureDirectoryExists(thumbnailDir);

      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

      // Generate thumbnail using Sharp
      await sharp(filePath)
        .resize(UPLOAD_CONFIG.IMAGE_PROCESSING.THUMBNAIL_SIZE, UPLOAD_CONFIG.IMAGE_PROCESSING.THUMBNAIL_SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: UPLOAD_CONFIG.IMAGE_PROCESSING.QUALITY })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      this.logger.error('Failed to process image:', error);
      throw error;
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private generatePublicUrl(filePath: string): string {
    // Convert file path to public URL
    const relativePath = filePath.replace(/^uploads\//, '');
    return `/api/files/serve/${relativePath}`;
  }

  async getFileMetadata(filePath: string, mimetype: string): Promise<any> {
    try {
      const stats = await fs.stat(filePath);
      const metadata: any = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };

      // Add specific metadata based on file type
      if (mimetype.startsWith('image/')) {
        try {
          const imageMetadata = await sharp(filePath).metadata();
          metadata.image = {
            width: imageMetadata.width,
            height: imageMetadata.height,
            format: imageMetadata.format,
            hasAlpha: imageMetadata.hasAlpha,
            colorSpace: imageMetadata.space,
          };
        } catch (error) {
          this.logger.warn('Failed to extract image metadata:', error);
        }
      }

      return metadata;
    } catch (error) {
      this.logger.error('Failed to get file metadata:', error);
      return {};
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        return;
      }

      // Delete physical files
      try {
        await fs.unlink(file.path);
        if (file.thumbnail) {
          const thumbnailPath = file.thumbnail.replace('/api/files/serve/', 'uploads/');
          await fs.unlink(thumbnailPath);
        }
      } catch (error) {
        this.logger.warn(`Failed to delete physical file: ${error.message}`);
      }

      // Delete from database
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileId}:`, error);
      throw error;
    }
  }
}