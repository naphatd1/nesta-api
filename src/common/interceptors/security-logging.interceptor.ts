import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = request.user?.id || 'Anonymous';

    // Log security-relevant requests
    if (this.isSecurityRelevant(url)) {
      this.logger.log(
        `Security Event: ${method} ${url} - User: ${userId} - IP: ${ip} - UserAgent: ${userAgent}`
      );
    }

    // Log failed authentication attempts
    return next.handle().pipe(
      tap({
        error: (error) => {
          if (error.status === 401 || error.status === 403) {
            this.logger.warn(
              `Security Alert: ${error.status} ${error.message} - ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`
            );
          }
        },
      }),
    );
  }

  private isSecurityRelevant(url: string): boolean {
    const securityEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/users',
      '/auth/create-admin',
    ];
    
    return securityEndpoints.some(endpoint => url.includes(endpoint));
  }
}