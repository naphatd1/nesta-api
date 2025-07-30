import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '@prisma/client';

export class UploadFileDto {
  @ApiPropertyOptional({ example: 'uuid-string', description: 'Post ID to associate with the file' })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional({ example: 'Profile picture', description: 'File description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: FileType, description: 'File type' })
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
  @ApiProperty({ example: 'uuid-string', description: 'File ID' })
  id: string;

  @ApiProperty({ example: 'image.jpg', description: 'Original filename' })
  originalName: string;

  @ApiProperty({ example: 'processed-image.jpg', description: 'Processed filename' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg', description: 'File MIME type' })
  mimetype: string;

  @ApiProperty({ example: 1024000, description: 'File size in bytes' })
  size: number;

  @ApiProperty({ enum: FileType, description: 'File type' })
  type: FileType;

  @ApiPropertyOptional({ example: 'https://example.com/file.jpg', description: 'File URL' })
  url?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg', description: 'Thumbnail URL' })
  thumbnail?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
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