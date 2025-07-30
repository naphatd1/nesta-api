import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ImageUploadService } from '../services/image-upload.service';
import { FileProcessingService } from '../services/file-processing.service';
import { UploadFileDto } from '../dto/upload.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Image Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload/images')
@UseGuards(JwtAuthGuard)
export class ImageUploadController {
  constructor(
    private readonly imageUploadService: ImageUploadService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        postId: {
          type: 'string',
          description: 'Optional post ID to associate with the image',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  @UseInterceptors(FileInterceptor('image'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Upload request:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        userId: user.id,
        postId: uploadDto?.postId
      });

      const result = await this.imageUploadService.uploadImage(
        file,
        user.id,
        uploadDto?.postId,
      );

      console.log('Upload successful:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        postId: {
          type: 'string',
          description: 'Optional post ID to associate with the images',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 batch uploads per minute
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    return this.imageUploadService.uploadMultipleImages(
      files,
      user.id,
      uploadDto.postId,
    );
  }

  @Get('my-images')
  @ApiOperation({ summary: 'Get current user images' })
  @ApiResponse({ status: 200, description: 'User images retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyImages(@CurrentUser() user: any) {
    return this.imageUploadService.getImagesByUser(user.id);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get images by post ID' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post images retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getImagesByPost(@Param('postId') postId: string) {
    return this.imageUploadService.getImagesByPost(postId);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete image' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found or access denied' })
  async deleteImage(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    // Verify ownership before deletion
    const file = await this.imageUploadService.getImagesByUser(user.id);
    const userFile = file.find(f => f.id === fileId);
    
    if (!userFile) {
      throw new Error('File not found or access denied');
    }

    return this.fileProcessingService.deleteFile(fileId);
  }
}