import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DocumentUploadService } from '../services/document-upload.service';
import { FileProcessingService } from '../services/file-processing.service';
import { UploadFileDto } from '../dto/upload.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('upload/documents')
@UseGuards(JwtAuthGuard)
export class DocumentUploadController {
  constructor(
    private readonly documentUploadService: DocumentUploadService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  @Post('single')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
  @UseInterceptors(FileInterceptor('document'))
  async uploadSingleDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    return this.documentUploadService.uploadDocument(
      file,
      user.id,
      uploadDto.postId,
    );
  }

  @Post('multiple')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 batch uploads per minute
  @UseInterceptors(FilesInterceptor('documents', 5)) // Max 5 files
  async uploadMultipleDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    return this.documentUploadService.uploadMultipleDocuments(
      files,
      user.id,
      uploadDto.postId,
    );
  }

  @Get('my-documents')
  async getMyDocuments(@CurrentUser() user: any) {
    return this.documentUploadService.getDocumentsByUser(user.id);
  }

  @Get('post/:postId')
  async getDocumentsByPost(@Param('postId') postId: string) {
    return this.documentUploadService.getDocumentsByPost(postId);
  }

  @Delete(':fileId')
  async deleteDocument(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    // Verify ownership before deletion
    const files = await this.documentUploadService.getDocumentsByUser(user.id);
    const userFile = files.find(f => f.id === fileId);
    
    if (!userFile) {
      throw new Error('File not found or access denied');
    }

    return this.fileProcessingService.deleteFile(fileId);
  }
}