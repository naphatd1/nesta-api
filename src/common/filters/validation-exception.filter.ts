import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Format validation errors
    const errorResponse = {
      statusCode: status,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] || 'unknown',
      validationErrors: this.formatValidationErrors(exceptionResponse),
    };

    // Log validation error
    this.logger.warn(
      `Validation Error: ${request.method} ${request.url} - ${JSON.stringify(errorResponse.validationErrors)}`
    );

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(exceptionResponse: any) {
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message.map((error: string) => {
        // Parse class-validator error messages
        const parts = error.split(' ');
        const property = parts[0];
        const constraint = parts.slice(1).join(' ');

        return {
          property,
          constraint,
          message: error,
        };
      });
    }

    return exceptionResponse.message || 'Validation failed';
  }
}