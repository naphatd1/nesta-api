import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ErrorLog {
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: string;
  stack?: string;
  metadata?: any;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

@Injectable()
export class ErrorLoggingService {
  private readonly logger = new Logger(ErrorLoggingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logError(errorLog: ErrorLog) {
    try {
      // Log to console/file
      this.logToConsole(errorLog);

      // Log to database (optional - create error_logs table if needed)
      // await this.logToDatabase(errorLog);

      // Send to external service (optional)
      // await this.sendToExternalService(errorLog);
    } catch (error) {
      this.logger.error('Failed to log error:', error);
    }
  }

  private logToConsole(errorLog: ErrorLog) {
    const logMessage = `${errorLog.message} - ${errorLog.context || 'Unknown'}`;
    const metadata = {
      userId: errorLog.userId,
      requestId: errorLog.requestId,
      ip: errorLog.ip,
      method: errorLog.method,
      url: errorLog.url,
      metadata: errorLog.metadata,
    };

    switch (errorLog.level) {
      case 'error':
        this.logger.error(logMessage, errorLog.stack, metadata);
        break;
      case 'warn':
        this.logger.warn(logMessage, metadata);
        break;
      case 'info':
        this.logger.log(logMessage, metadata);
        break;
    }
  }

  // Uncomment and modify if you want to store errors in database
  /*
  private async logToDatabase(errorLog: ErrorLog) {
    try {
      await this.prisma.errorLog.create({
        data: {
          level: errorLog.level,
          message: errorLog.message,
          context: errorLog.context,
          stack: errorLog.stack,
          metadata: errorLog.metadata,
          userId: errorLog.userId,
          requestId: errorLog.requestId,
          ip: errorLog.ip,
          userAgent: errorLog.userAgent,
          method: errorLog.method,
          url: errorLog.url,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to save error to database:', error);
    }
  }
  */

  private async sendToExternalService(errorLog: ErrorLog) {
    // Implement external logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry
      // Sentry.captureException(new Error(errorLog.message), {
      //   level: errorLog.level,
      //   contexts: {
      //     user: { id: errorLog.userId },
      //     request: {
      //       method: errorLog.method,
      //       url: errorLog.url,
      //       ip: errorLog.ip,
      //     },
      //   },
      //   extra: errorLog.metadata,
      // });
    }
  }

  async getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    // Implement error statistics if storing in database
    const stats = {
      totalErrors: 0,
      errorsByLevel: {
        error: 0,
        warn: 0,
        info: 0,
      },
      topErrors: [],
      errorTrends: [],
    };

    return stats;
  }
}