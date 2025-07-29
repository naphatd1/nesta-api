import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseStorageService } from '../../upload/services/supabase-storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileStorageMetricsService {
  private readonly logger = new Logger(FileStorageMetricsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  async getStorageStats() {
    const [localStats, supabaseStats, databaseStats] = await Promise.all([
      this.getLocalStorageStats(),
      this.getSupabaseStorageStats(),
      this.getDatabaseStorageStats(),
    ]);

    return {
      local: localStats,
      supabase: supabaseStats,
      database: databaseStats,
      disk: await this.getDiskUsage(),
    };
  }

  async getDetailedStats() {
    const basic = await this.getStorageStats();
    const fileDistribution = await this.getFileDistribution();
    const storageHealth = await this.getStorageHealth();

    return {
      ...basic,
      distribution: fileDistribution,
      health: storageHealth,
    };
  }

  async getHealthStatus() {
    try {
      const issues = [];
      const stats = await this.getStorageStats();

      // Check disk usage
      if (stats.disk.usage > 85) {
        issues.push('Low disk space');
      }

      // Check if we can write to local storage
      try {
        const testFile = path.join('uploads', 'temp', '.health-check');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch (error) {
        issues.push('Cannot write to local storage');
      }

      // Check Supabase connectivity
      if (this.supabaseStorage.isEnabled()) {
        try {
          await this.supabaseStorage.listFiles('uploads', '');
        } catch (error) {
          issues.push('Supabase storage connection failed');
        }
      }

      return {
        healthy: issues.length === 0,
        issues,
        stats: {
          diskUsage: stats.disk.usage,
          localFiles: stats.local.fileCount,
          supabaseEnabled: stats.supabase.enabled,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        issues: ['Storage health check failed'],
        error: error.message,
      };
    }
  }

  private async getLocalStorageStats() {
    try {
      const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/videos', 'uploads/audio', 'uploads/thumbnails'];
      let totalFiles = 0;
      let totalSize = 0;
      const breakdown = {};

      for (const dir of uploadDirs) {
        try {
          const files = await fs.readdir(dir);
          let dirSize = 0;
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
              dirSize += stats.size;
            }
          }

          const dirName = path.basename(dir);
          breakdown[dirName] = {
            fileCount: files.length,
            size: dirSize,
          };
          
          totalFiles += files.length;
          totalSize += dirSize;
        } catch (error) {
          breakdown[path.basename(dir)] = {
            fileCount: 0,
            size: 0,
            error: 'Directory not accessible',
          };
        }
      }

      return {
        fileCount: totalFiles,
        totalSize,
        breakdown,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  private async getSupabaseStorageStats() {
    try {
      if (!this.supabaseStorage.isEnabled()) {
        return {
          enabled: false,
          message: 'Supabase storage not configured',
        };
      }

      // Try to list files in the uploads bucket
      const files = await this.supabaseStorage.listFiles('uploads', '');
      
      return {
        enabled: true,
        fileCount: files.length,
        buckets: ['uploads'], // You could expand this to list all buckets
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        enabled: true,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async getDatabaseStorageStats() {
    try {
      const [totalFiles, storageByType, storageByStatus] = await Promise.all([
        this.prisma.file.count(),
        this.prisma.file.groupBy({
          by: ['type'],
          _sum: { size: true },
          _count: { id: true },
        }),
        this.prisma.file.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
      ]);

      const totalSize = await this.prisma.file.aggregate({
        _sum: { size: true },
      });

      return {
        totalFiles,
        totalSize: totalSize._sum.size || 0,
        byType: storageByType.reduce((acc, item) => {
          acc[item.type] = {
            count: item._count.id,
            size: item._sum.size || 0,
          };
          return acc;
        }, {}),
        byStatus: storageByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  private async getDiskUsage() {
    try {
      // This is a simplified version - you might want to use a proper disk usage library
      const stats = await fs.stat('.');
      return {
        total: 'N/A',
        used: 'N/A',
        free: 'N/A',
        usage: 0,
        note: 'Install diskusage package for detailed disk metrics',
      };
    } catch (error) {
      return {
        error: 'Unable to get disk usage',
      };
    }
  }

  private async getFileDistribution() {
    try {
      const distribution = await this.prisma.file.groupBy({
        by: ['type', 'status'],
        _count: { id: true },
        _sum: { size: true },
      });

      return distribution.map(item => ({
        type: item.type,
        status: item.status,
        count: item._count.id,
        size: item._sum.size || 0,
      }));
    } catch (error) {
      return { error: error.message };
    }
  }

  private async getStorageHealth() {
    const issues = [];
    const warnings = [];

    try {
      // Check for failed uploads
      const failedUploads = await this.prisma.file.count({
        where: { status: 'FAILED' },
      });

      if (failedUploads > 0) {
        warnings.push(`${failedUploads} failed uploads found`);
      }

      // Check for stuck uploads (uploading for more than 1 hour)
      const stuckUploads = await this.prisma.file.count({
        where: {
          status: 'UPLOADING',
          createdAt: {
            lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          },
        },
      });

      if (stuckUploads > 0) {
        warnings.push(`${stuckUploads} uploads stuck in uploading state`);
      }

      return {
        healthy: issues.length === 0,
        issues,
        warnings,
        checks: {
          failedUploads,
          stuckUploads,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        issues: ['Storage health check failed'],
        error: error.message,
      };
    }
  }
}