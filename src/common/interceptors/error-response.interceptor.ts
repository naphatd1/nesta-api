import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const requestId = request.headers['x-request-id'] || 'unknown';

        // Add request ID to error for tracking
        if (error instanceof HttpException) {
          const response = error.getResponse() as any;
          if (typeof response === 'object') {
            response.requestId = requestId;
          }
        }

        // Log error with context
        this.logErrorWithContext(error, request);

        return throwError(() => error);
      }),
    );
  }

  private logErrorWithContext(error: any, request: any) {
    const context = {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.user?.id || 'Anonymous',
      requestId: request.headers['x-request-id'] || 'unknown',
    };

    if (error instanceof HttpException) {
      const status = error.getStatus();
      if (status >= 500) {
        this.logger.error(`HTTP ${status}: ${error.message}`, {
          ...context,
          stack: error.stack,
        });
      } else {
        this.logger.warn(`HTTP ${status}: ${error.message}`, context);
      }
    } else {
      this.logger.error('Unexpected error:', {
        ...context,
        error: error.message,
        stack: error.stack,
      });
    }
  }
}