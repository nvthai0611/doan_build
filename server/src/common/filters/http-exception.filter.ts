import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

function serializeForJson(value: any): any {
  if (typeof value === 'bigint') return value.toString();
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  const hasToNumber = typeof (value as any).toNumber === 'function';
  const hasToString = typeof (value as any).toString === 'function';
  if (hasToNumber || (hasToString && value.constructor?.name === 'Decimal')) {
    try {
      return hasToNumber
        ? (value as any).toNumber()
        : parseFloat((value as any).toString());
    } catch {
      return (value as any).toString();
    }
  }
  if (Array.isArray(value)) return value.map(serializeForJson);
  const output: Record<string, any> = {};
  for (const key of Object.keys(value))
    output[key] = serializeForJson((value as any)[key]);
  return output;
}

@Catch() // không truyền gì -> bắt "mọi" exception
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Lấy HTTP context (Nest có các context khác: RPC, WS...)
    const ctx = host.switchToHttp();
    // Lấy ra Express Response để set status + trả JSON
    const res = ctx.getResponse<Response>();

    // Nếu là HttpException (BadRequestException, NotFoundException, ...)
    // -> lấy status từ exception, ngược lại -> 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Nếu là HttpException -> getResponse() có thể là string hoặc object
    // Ví dụ ValidationPipe thường trả: { statusCode, message: string[] | string, error }
    // Nếu là lỗi thường -> dùng exception.message
    const response =
      exception instanceof HttpException
        ? (exception.getResponse() as any)
        : { message: exception.message };
    let message: string;
    let error: string;

    if (typeof response === 'string') {
      // Chỉ có message string
      message = response;
      // Tự động map status code thành error name
      error = this.getErrorNameFromStatus(status);
    } else if (response && typeof response === 'object') {
      // Có object với message và có thể có error
      message = response.message || 'Something went wrong';
      error = response.error || this.getErrorNameFromStatus(status);
    } else {
      message = 'Something went wrong';
      error = 'Internal Server Error';
    }
    // Đặt HTTP status code ở header + trả body JSON theo schema thống nhất
    res.status(status).json({
      success: false,
      status, // status cũng có trong body cho client đọc dễ
      error: serializeForJson(error), // giữ nguyên payload nhưng đã serialize an toàn
      message: serializeForJson(message) || 'Internal server error', // message ngắn gọn để hiển thị
    });
  }
  private getErrorNameFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable Entity';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Unknown Error';
    }
  }
}
