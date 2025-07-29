import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabaseMetricsService {
  private readonly logger = new Logger(DatabaseMetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDatabaseStats() {
    try {
      const [userCount, postCount, fileCount, recentActivity] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.post.count(),
        this.prisma.file.count(),
        this.getRecentActivity(),
      ]);

      return {
        connected: true,
        tables: {
          users: userCount,
          posts: postCount,
          files: fileCount,
        },
        connections: {
          active: 1, // Prisma doesn't expose connection pool info easily
          max: 10, // Default connection limit
        },
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats:', error);
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async getDetailedStats() {
    try {
      const basic = await this.getDatabaseStats();
      
      const [
        userStats,
        postStats,
        fileStats,
        storageStats,
      ] = await Promise.all([
        this.getUserStats(),
        this.getPostStats(),
        this.getFileStats(),
        this.getStorageStats(),
      ]);

      return {
        ...basic,
        detailed: {
          users: userStats,
          posts: postStats,
          files: fileStats,
          storage: storageStats,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get detailed database stats:', error);
      return {
        error: error.message,
      };
    }
  }

  async getHealthStatus() {
    try {
      // Simple connection test
      await this.prisma.$queryRaw`SELECT 1`;
      
      const stats = await this.getDatabaseStats();
      const issues = [];

      if (!stats.connected) {
        issues.push('Database connection failed');
      }

      return {
        healthy: issues.length === 0,
        issues,
        connectionTime: Date.now(), // You could measure actual connection time
      };
    } catch (error) {
      return {
        healthy: false,
        issues: ['Database connection failed'],
        error: error.message,
      };
    }
  }

  private async getRecentActivity() {
    try {
      const [recentUsers, recentPosts, recentFiles] = await Promise.all([
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
        this.prisma.post.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        this.prisma.file.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        last24Hours: {
          newUsers: recentUsers,
          newPosts: recentPosts,
          newFiles: recentFiles,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get recent activity:', error);
      return { error: 'Failed to get recent activity' };
    }
  }

  private async getUserStats() {
    try {
      const [total, active, byRole] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
      ]);

      return {
        total,
        active,
        inactive: total - active,
        byRole: byRole.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {}),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async getPostStats() {
    try {
      const [total, published, byStatus] = await Promise.all([
        this.prisma.post.count(),
        this.prisma.post.count({ where: { published: true } }),
        this.prisma.post.groupBy({
          by: ['published'],
          _count: { id: true },
        }),
      ]);

      return {
        total,
        published,
        draft: total - published,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.published ? 'published' : 'draft'] = item._count.id;
          return acc;
        }, {}),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async getFileStats() {
    try {
      const [total, byType, byStatus, totalSize] = await Promise.all([
        this.prisma.file.count(),
        this.prisma.file.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
        this.prisma.file.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.file.aggregate({
          _sum: { size: true },
        }),
      ]);

      return {
        total,
        totalSize: totalSize._sum.size || 0,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async getStorageStats() {
    try {
      const storageByType = await this.prisma.file.groupBy({
        by: ['type'],
        _sum: { size: true },
        _count: { id: true },
      });

      return {
        byType: storageByType.reduce((acc, item) => {
          acc[item.type] = {
            count: item._count.id,
            size: item._sum.size || 0,
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}