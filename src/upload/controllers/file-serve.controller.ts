import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  UseGuards,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

@Controller('files')
export class FileServeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('serve/images/:filename')
  async serveImage(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.serveFileByType('images', filename, res);
  }

  @Get('serve/documents/:filename')
  async serveDocument(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.serveFileByType('documents', filename, res);
  }

  @Get('serve/videos/:filename')
  async serveVideo(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.serveFileByType('videos', filename, res);
  }

  @Get('serve/audio/:filename')
  async serveAudio(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.serveFileByType('audio', filename, res);
  }

  @Get('serve/thumbnails/:filename')
  async serveThumbnail(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.serveFileByType('thumbnails', filename, res);
  }

  private async serveFileByType(
    folder: string,
    filename: string,
    res: Response,
  ) {
    try {
      const fullPath = path.join('uploads', folder, filename);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404);
        return { error: 'File not found' };
      }

      // Get file stats
      const stats = fs.statSync(fullPath);
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

      // Set headers
      res.set({
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
      });

      // Create readable stream
      const fileStream = fs.createReadStream(fullPath);
      return new StreamableFile(fileStream);
    } catch (error) {
      res.status(500);
      return { error: 'Failed to serve file' };
    }
  }

  @Get('download/:fileId')
  @UseGuards(JwtAuthGuard)
  async downloadFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Get file record
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        res.status(404);
        return { error: 'File not found' };
      }

      // Check if file exists
      if (!fs.existsSync(file.path)) {
        res.status(404);
        return { error: 'Physical file not found' };
      }

      // Set download headers
      res.set({
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.size.toString(),
      });

      // Create readable stream
      const fileStream = fs.createReadStream(file.path);
      return new StreamableFile(fileStream);
    } catch (error) {
      res.status(500);
      return { error: 'Failed to download file' };
    }
  }

  @Get('info/:fileId')
  @UseGuards(JwtAuthGuard)
  async getFileInfo(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
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
        metadata: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async listFiles(@CurrentUser() user: any) {
    const files = await this.prisma.file.findMany({
      where: { uploadedById: user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    return files;
  }
}