import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ChunkUploadService } from '../services/chunk-upload.service';
import {
  InitiateUploadDto,
  ChunkUploadDto,
  CompleteUploadDto,
} from '../dto/upload.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('upload/chunk')
@UseGuards(JwtAuthGuard)
export class ChunkUploadController {
  constructor(private readonly chunkUploadService: ChunkUploadService) {}

  @Post('initiate')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 initiations per minute
  async initiateUpload(
    @Body() initiateDto: InitiateUploadDto,
    @CurrentUser() user: any,
  ) {
    return this.chunkUploadService.initiateUpload(initiateDto, user.id);
  }

  @Post('upload')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 chunks per minute
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body() chunkDto: ChunkUploadDto,
  ) {
    if (!file) {
      throw new Error('No chunk data provided');
    }

    return this.chunkUploadService.uploadChunk(chunkDto, file.buffer);
  }

  @Post('complete')
  async completeUpload(@Body() completeDto: CompleteUploadDto) {
    return this.chunkUploadService.completeUpload(completeDto);
  }

  @Get('progress/:fileId')
  async getUploadProgress(@Param('fileId') fileId: string) {
    return this.chunkUploadService.getUploadProgress(fileId);
  }

  @Delete('cancel/:fileId')
  async cancelUpload(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    return this.chunkUploadService.cancelUpload(fileId, user.id);
  }
}