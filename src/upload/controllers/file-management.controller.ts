import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { FileType, FileStatus } from '@prisma/client';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileManagementController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my-files')
  async getMyFiles(
    @CurrentUser() user: any,
    @Query('type') type?: FileType,
    @Query('status') status?: FileStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      uploadedById: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
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
          updatedAt: true,
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      files,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('all-files')
  async getAllFiles(
    @Query('type') type?: FileType,
    @Query('status') status?: FileStatus,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
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
          updatedAt: true,
          uploadedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      files,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('stats')
  async getFileStats(@CurrentUser() user: any) {
    const stats = await this.prisma.file.groupBy({
      by: ['type', 'status'],
      where: {
        uploadedById: user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        size: true,
      },
    });

    const totalFiles = await this.prisma.file.count({
      where: {
        uploadedById: user.id,
      },
    });

    const totalSize = await this.prisma.file.aggregate({
      where: {
        uploadedById: user.id,
      },
      _sum: {
        size: true,
      },
    });

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      breakdown: stats,
    };
  }

  @Get(':fileId/details')
  async getFileDetails(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  }
}