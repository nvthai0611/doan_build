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
      return hasToNumber ? (value as any).toNumber() : parseFloat((value as any).toString());
    } catch {
      return (value as any).toString();
    }
  }
  if (Array.isArray(value)) return value.map(serializeForJson);
  const output: Record<string, any> = {};
  for (const key of Object.keys(value)) output[key] = serializeForJson((value as any)[key]);
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

    // Đặt HTTP status code ở header + trả body JSON theo schema thống nhất
    res.status(status).json({
      success: false,
      status, // status cũng có trong body cho client đọc dễ
      error: serializeForJson(response), // giữ nguyên payload nhưng đã serialize an toàn
      message: (response && response.message) || 'Internal server error', // message ngắn gọn để hiển thị
    });
  }
}
