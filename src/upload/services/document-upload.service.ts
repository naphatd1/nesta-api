import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileType, FileStatus } from '@prisma/client';
import { UPLOAD_CONFIG } from '../config/upload.config';
import { FileProcessingService } from './file-processing.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentUploadService {
  private readonly logger = new Logger(DocumentUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    postId?: string,
  ): Promise<any> {
    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_MIMETYPES.DOCUMENT.includes(file.mimetype)) {
      throw new BadRequestException('Invalid document file type');
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE.DOCUMENT) {
      throw new BadRequestException('Document file too large');
    }

    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      // Ensure upload directory exists
      const uploadDir = UPLOAD_CONFIG.UPLOAD_PATHS.DOCUMENT;
      await this.ensureDirectoryExists(uploadDir);
      
      // Save file to disk
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, file.buffer);

      // Get file metadata
      const metadata = await this.getDocumentMetadata(file, filePath);

      // Save file record to database
      const fileRecord = await this.prisma.file.create({
        data: {
          originalName: file.originalname,
          filename: uniqueFilename,
          mimetype: file.mimetype,
          size: file.size,
          type: FileType.DOCUMENT,
          status: FileStatus.UPLOADING,
          path: filePath,
          metadata,
          uploadedById: userId,
          postId,
        },
      });

      // Process file asynchronously
      this.fileProcessingService.processFile(fileRecord.id).catch((error) => {
        this.logger.error('Failed to process document:', error);
      });

      return {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        type: fileRecord.type,
        status: fileRecord.status,
        documentType: this.getDocumentType(file.mimetype),
        createdAt: fileRecord.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to upload document:', error);
      throw new BadRequestException('Failed to upload document');
    }
  }

  async uploadMultipleDocuments(
    files: Express.Multer.File[],
    userId: string,
    postId?: string,
  ): Promise<any[]> {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.uploadDocument(file, userId, postId);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to upload document ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false,
        });
      }
    }

    return results;
  }

  async getDocumentsByUser(userId: string): Promise<any[]> {
    const documents = await this.prisma.file.findMany({
      where: {
        uploadedById: userId,
        type: FileType.DOCUMENT,
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
        metadata: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return documents.map(doc => ({
      ...doc,
      documentType: this.getDocumentType(doc.mimetype),
      sizeFormatted: this.formatFileSize(doc.size),
    }));
  }

  async getDocumentsByPost(postId: string): Promise<any[]> {
    const documents = await this.prisma.file.findMany({
      where: {
        postId,
        type: FileType.DOCUMENT,
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
        metadata: true,
        createdAt: true,
      },
    });

    return documents.map(doc => ({
      ...doc,
      documentType: this.getDocumentType(doc.mimetype),
      sizeFormatted: this.formatFileSize(doc.size),
    }));
  }

  private async getDocumentMetadata(file: Express.Multer.File, filePath: string): Promise<any> {
    const metadata: any = {
      documentType: this.getDocumentType(file.mimetype),
      sizeFormatted: this.formatFileSize(file.size),
    };

    // Add specific metadata based on document type
    try {
      const stats = await fs.stat(filePath);
      metadata.fileStats = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      this.logger.warn('Failed to get file stats:', error);
    }

    return metadata;
  }

  private getDocumentType(mimetype: string): string {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
      'text/plain': 'Text File',
      'text/csv': 'CSV File',
      'application/rtf': 'Rich Text Format',
    };

    return typeMap[mimetype] || 'Document';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}