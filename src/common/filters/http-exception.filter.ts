import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const error =
      typeof exceptionResponse === "string"
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    // Custom error messages for validation errors
    if (status === HttpStatus.BAD_REQUEST && error["message"]) {
      const messages = Array.isArray(error["message"])
        ? error["message"]
        : [error["message"]];

      // Translate common validation messages to Thai
      const translatedMessages = messages.map((msg) =>
        this.translateValidationMessage(msg)
      );

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: "ข้อมูลไม่ถูกต้อง",
        message: translatedMessages,
        success: false,
      });
      return;
    }

    // Custom error messages for authentication errors
    if (status === HttpStatus.UNAUTHORIZED) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: "การยืนยันตัวตนไม่สำเร็จ",
        message: error["message"] || "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        success: false,
      });
      return;
    }

    // Custom error messages for conflict errors
    if (status === HttpStatus.CONFLICT) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: "ข้อมูลซ้ำซ้อน",
        message: error["message"] || "ข้อมูลนี้มีอยู่ในระบบแล้ว",
        success: false,
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: this.translateErrorType(exception.name),
      message: error["message"] || exception.message,
      success: false,
    });
  }

  private translateValidationMessage(message: string): string {
    // Common validation message translations
    const translations = {
      "email must be an email":
        "กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com",
      "password should not be empty": "กรุณากรอกรหัสผ่านของคุณ",
      "password must be longer than or equal to 8 characters":
        "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
      "name should not be empty": "กรุณากรอกชื่อของคุณ",
    };

    // Check for exact matches first
    if (translations[message]) {
      return translations[message];
    }

    // Check for partial matches
    if (message.includes("email")) {
      return "กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com";
    }
    if (message.includes("password")) {
      return "กรุณาตรวจสอบรหัสผ่านของคุณ";
    }
    if (message.includes("must be")) {
      return "ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด";
    }

    return message; // Return original if no translation found
  }

  private translateErrorType(errorName: string): string {
    const errorTranslations = {
      UnauthorizedException: "การยืนยันตัวตนไม่สำเร็จ",
      BadRequestException: "ข้อมูลไม่ถูกต้อง",
      ConflictException: "ข้อมูลซ้ำซ้อน",
      NotFoundException: "ไม่พบข้อมูลที่ต้องการ",
      ForbiddenException: "ไม่มีสิทธิ์เข้าถึง",
      InternalServerErrorException: "เกิดข้อผิดพลาดของระบบ",
    };

    return errorTranslations[errorName] || "เกิดข้อผิดพลาด";
  }
}
