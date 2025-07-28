import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorLoggingService } from '../common/services/error-logging.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLoggingService: ErrorLoggingService,
  ) {}

  async getHealthStatus() {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      };
    }
  }

  async getDetailedHealthStatus() {
    const basic = await this.getHealthStatus();
    
    try {
      // Additional health checks
      const [userCount, postCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.post.count(),
      ]);

      return {
        ...basic,
        database: {
          status: 'connected',
          users: userCount,
          posts: postCount,
        },
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
        },
      };
    } catch (error) {
      return {
        ...basic,
        database: {
          status: 'error',
          error: error.message,
        },
      };
    }
  }

  async getErrorStatistics() {
    try {
      const stats = await this.errorLoggingService.getErrorStats();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        errorStats: stats,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to retrieve error statistics',
      };
    }
  }
}