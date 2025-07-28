import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileType, FileStatus } from '@prisma/client';
import { UPLOAD_CONFIG, getFileTypeFromMimetype } from '../config/upload.config';
import { FileProcessingService } from './file-processing.service';
import { InitiateUploadDto, ChunkUploadDto, CompleteUploadDto } from '../dto/upload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChunkUploadService {
  private readonly logger = new Logger(ChunkUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  async initiateUpload(
    initiateDto: InitiateUploadDto,
    userId: string,
  ): Promise<any> {
    const { filename, mimetype, size, postId, description } = initiateDto;

    // Validate file type and size
    const fileType = getFileTypeFromMimetype(mimetype) as FileType;
    const maxSize = UPLOAD_CONFIG.MAX_FILE_SIZE[fileType] || UPLOAD_CONFIG.MAX_FILE_SIZE.OTHER;

    if (size > maxSize) {
      throw new BadRequestException(`File too large. Maximum size: ${maxSize} bytes`);
    }

    // Calculate number of chunks
    const totalChunks = Math.ceil(size / UPLOAD_CONFIG.CHUNK_SIZE);

    if (totalChunks > UPLOAD_CONFIG.MAX_CHUNKS) {
      throw new BadRequestException('File too large for chunk upload');
    }

    try {
      // Generate unique filename
      const fileExtension = path.extname(filename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      // Determine upload path based on file type
      const uploadPath = this.getUploadPath(fileType);
      const filePath = path.join(uploadPath, uniqueFilename);

      // Create file record
      const fileRecord = await this.prisma.file.create({
        data: {
          originalName: filename,
          filename: uniqueFilename,
          mimetype,
          size,
          type: fileType,
          status: FileStatus.UPLOADING,
          path: filePath,
          metadata: {
            totalChunks,
            uploadedChunks: 0,
            description,
          },
          uploadedById: userId,
          postId,
        },
      });

      return {
        fileId: fileRecord.id,
        totalChunks,
        chunkSize: UPLOAD_CONFIG.CHUNK_SIZE,
        uploadUrl: `/api/upload/chunk`,
      };
    } catch (error) {
      this.logger.error('Failed to initiate upload:', error);
      throw new BadRequestException('Failed to initiate upload');
    }
  }

  async uploadChunk(
    chunkDto: ChunkUploadDto,
    chunkData: Buffer,
  ): Promise<any> {
    const { fileId, chunkIndex, totalChunks } = chunkDto;

    try {
      // Verify file exists
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new BadRequestException('File not found');
      }

      if (file.status !== FileStatus.UPLOADING) {
        throw new BadRequestException('File is not in uploading state');
      }

      // Store chunk in database
      await this.prisma.fileChunk.upsert({
        where: {
          fileId_chunkIndex: {
            fileId,
            chunkIndex,
          },
        },
        update: {
          data: chunkData,
        },
        create: {
          fileId,
          chunkIndex,
          data: chunkData,
        },
      });

      // Update file metadata
      const uploadedChunks = await this.prisma.fileChunk.count({
        where: { fileId },
      });

      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          metadata: {
            ...((file.metadata as any) || {}),
            uploadedChunks,
            totalChunks,
          },
        },
      });

      const percentage = Math.round((uploadedChunks / totalChunks) * 100);

      return {
        fileId,
        chunkIndex,
        uploadedChunks,
        totalChunks,
        percentage,
        completed: uploadedChunks === totalChunks,
      };
    } catch (error) {
      this.logger.error('Failed to upload chunk:', error);
      throw new BadRequestException('Failed to upload chunk');
    }
  }

  async completeUpload(completeDto: CompleteUploadDto): Promise<any> {
    const { fileId, totalChunks } = completeDto;

    try {
      // Verify all chunks are uploaded
      const uploadedChunks = await this.prisma.fileChunk.count({
        where: { fileId },
      });

      if (uploadedChunks !== totalChunks) {
        throw new BadRequestException('Not all chunks uploaded');
      }

      // Get file record
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new BadRequestException('File not found');
      }

      // Ensure upload directory exists
      await this.ensureDirectoryExists(path.dirname(file.path));

      // Reassemble file from chunks
      const chunks = await this.prisma.fileChunk.findMany({
        where: { fileId },
        orderBy: { chunkIndex: 'asc' },
      });

      const fileBuffer = Buffer.concat(chunks.map(chunk => chunk.data));
      await fs.writeFile(file.path, fileBuffer);

      // Clean up chunks from database
      await this.prisma.fileChunk.deleteMany({
        where: { fileId },
      });

      // Update file status
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: FileStatus.PROCESSING,
          metadata: {
            ...((file.metadata as any) || {}),
            completed: true,
            completedAt: new Date(),
          },
        },
      });

      // Process file asynchronously
      this.fileProcessingService.processFile(fileId).catch((error) => {
        this.logger.error('Failed to process file:', error);
      });

      return {
        fileId,
        status: 'completed',
        message: 'File upload completed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to complete upload:', error);
      throw new BadRequestException('Failed to complete upload');
    }
  }

  async getUploadProgress(fileId: string): Promise<any> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        originalName: true,
        status: true,
        metadata: true,
      },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    const metadata = (file.metadata as any) || {};
    const uploadedChunks = await this.prisma.fileChunk.count({
      where: { fileId },
    });

    const totalChunks = metadata.totalChunks || 0;
    const percentage = totalChunks > 0 ? Math.round((uploadedChunks / totalChunks) * 100) : 0;

    return {
      fileId,
      originalName: file.originalName,
      status: file.status,
      uploadedChunks,
      totalChunks,
      percentage,
      completed: uploadedChunks === totalChunks,
    };
  }

  async cancelUpload(fileId: string, userId: string): Promise<any> {
    try {
      // Verify file ownership
      const file = await this.prisma.file.findFirst({
        where: {
          id: fileId,
          uploadedById: userId,
        },
      });

      if (!file) {
        throw new BadRequestException('File not found or access denied');
      }

      // Clean up chunks
      await this.prisma.fileChunk.deleteMany({
        where: { fileId },
      });

      // Delete file record
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      // Delete physical file if exists
      try {
        await fs.unlink(file.path);
      } catch (error) {
        // File might not exist yet, ignore error
      }

      return {
        fileId,
        status: 'cancelled',
        message: 'Upload cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Failed to cancel upload:', error);
      throw new BadRequestException('Failed to cancel upload');
    }
  }

  private getUploadPath(fileType: FileType): string {
    switch (fileType) {
      case FileType.IMAGE:
        return UPLOAD_CONFIG.UPLOAD_PATHS.IMAGE;
      case FileType.DOCUMENT:
        return UPLOAD_CONFIG.UPLOAD_PATHS.DOCUMENT;
      case FileType.VIDEO:
        return UPLOAD_CONFIG.UPLOAD_PATHS.VIDEO;
      case FileType.AUDIO:
        return UPLOAD_CONFIG.UPLOAD_PATHS.AUDIO;
      default:
        return UPLOAD_CONFIG.UPLOAD_PATHS.TEMP;
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}