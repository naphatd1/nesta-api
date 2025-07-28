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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ImageUploadService } from '../services/image-upload.service';
import { FileProcessingService } from '../services/file-processing.service';
import { UploadFileDto } from '../dto/upload.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('upload/images')
@UseGuards(JwtAuthGuard)
export class ImageUploadController {
  constructor(
    private readonly imageUploadService: ImageUploadService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  @Post('single')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  @UseInterceptors(FileInterceptor('image'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    return this.imageUploadService.uploadImage(
      file,
      user.id,
      uploadDto.postId,
    );
  }

  @Post('multiple')
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
  async getMyImages(@CurrentUser() user: any) {
    return this.imageUploadService.getImagesByUser(user.id);
  }

  @Get('post/:postId')
  async getImagesByPost(@Param('postId') postId: string) {
    return this.imageUploadService.getImagesByPost(postId);
  }

  @Delete(':fileId')
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