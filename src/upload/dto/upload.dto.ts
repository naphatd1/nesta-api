import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { FileType } from '@prisma/client';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;
}

export class ChunkUploadDto {
  @IsString()
  fileId: string;

  @IsNumber()
  chunkIndex: number;

  @IsNumber()
  totalChunks: number;

  @IsString()
  filename: string;

  @IsString()
  mimetype: string;

  @IsNumber()
  totalSize: number;
}

export class InitiateUploadDto {
  @IsString()
  filename: string;

  @IsString()
  mimetype: string;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CompleteUploadDto {
  @IsString()
  fileId: string;

  @IsNumber()
  totalChunks: number;
}

export class FileResponseDto {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  type: FileType;
  url?: string;
  thumbnail?: string;
  createdAt: Date;
}

export class UploadProgressDto {
  @IsString()
  fileId: string;

  @IsNumber()
  uploadedChunks: number;

  @IsNumber()
  totalChunks: number;

  @IsNumber()
  percentage: number;

  @IsBoolean()
  completed: boolean;
}