import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    // Log the error
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request) {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const userAgent = request.headers['user-agent'];
    const ip = request.ip;
    const requestId = request.headers['x-request-id'] || 'unknown';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, { timestamp, path, method, requestId });
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, { timestamp, path, method, requestId });
    }

    if (exception instanceof PrismaClientValidationError) {
      return this.handlePrismaValidationError(exception, { timestamp, path, method, requestId });
    }

    if (exception instanceof ThrottlerException) {
      return this.handleThrottlerException(exception, { timestamp, path, method, requestId });
    }

    // Handle unknown errors
    return this.handleUnknownError(exception, { timestamp, path, method, requestId });
  }

  private handleHttpException(exception: HttpException, context: any) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object') {
      return {
        ...exceptionResponse,
        ...context,
      };
    }

    return {
      statusCode: status,
      message: exceptionResponse,
      error: this.getErrorName(status),
      ...context,
    };
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError, context: any) {
    let message = 'Database operation failed';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        statusCode = HttpStatus.CONFLICT;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = HttpStatus.NOT_FOUND;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      default:
        message = 'Database error occurred';
    }

    return {
      statusCode,
      message,
      error: 'Database Error',
      code: exception.code,
      details: process.env.NODE_ENV === 'development' ? exception.meta : undefined,
      ...context,
    };
  }

  private handlePrismaValidationError(exception: PrismaClientValidationError, context: any) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided',
      error: 'Validation Error',
      details: process.env.NODE_ENV === 'development' ? exception.message : undefined,
      ...context,
    };
  }

  private handleThrottlerException(exception: ThrottlerException, context: any) {
    return {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Too many requests, please try again later',
      error: 'Rate Limit Exceeded',
      retryAfter: 60,
      ...context,
    };
  }

  private handleUnknownError(exception: unknown, context: any) {
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
      ...context,
    };
  }

  private getErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }

  private logError(exception: unknown, request: Request, errorResponse: any) {
    const { statusCode, message, path, method } = errorResponse;
    const userId = (request as any).user?.id || 'Anonymous';
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    const logMessage = `${method} ${path} - ${statusCode} ${message} - User: ${userId} - IP: ${ip}`;

    if (statusCode >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : exception);
    } else if (statusCode >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    // Log additional details for debugging
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug('Request details:', {
        headers: request.headers,
        body: request.body,
        params: request.params,
        query: request.query,
      });
    }
  }
}