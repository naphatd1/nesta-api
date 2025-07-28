import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(message: string, errors?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: "Validation Error",
        details: errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class DatabaseException extends HttpException {
  constructor(message: string, originalError?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Database operation failed",
        error: "Database Error",
        details:
          process.env.NODE_ENV === "development" ? originalError : undefined,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class AuthenticationException extends HttpException {
  constructor(message: string = "Authentication failed") {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: "Authentication Error",
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class AuthorizationException extends HttpException {
  constructor(message: string = "Access denied") {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: "Authorization Error",
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;

    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: "Resource Not Found",
        resource,
        id,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        statusCode,
        message,
        error: "Business Logic Error",
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  }
}

export class RateLimitException extends HttpException {
  constructor(message: string = "Too many requests") {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: "Rate Limit Exceeded",
        timestamp: new Date().toISOString(),
        retryAfter: 60, // seconds
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}
