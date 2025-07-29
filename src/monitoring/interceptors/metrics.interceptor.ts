import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiMetricsService } from '../services/api-metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly apiMetrics: ApiMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetric(request, response, startTime);
        },
        error: () => {
          this.recordMetric(request, response, startTime);
        },
      }),
    );
  }

  private recordMetric(request: any, response: any, startTime: number) {
    const responseTime = Date.now() - startTime;
    
    this.apiMetrics.recordMetric({
      endpoint: request.route?.path || request.url,
      method: request.method,
      statusCode: response.statusCode,
      responseTime,
      timestamp: new Date(),
      userId: request.user?.id,
      userAgent: request.get('user-agent'),
      ip: request.ip,
    });
  }
}