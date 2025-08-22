import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

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
      error: response, // giữ nguyên payload gốc của lỗi (để debug/hiển thị chi tiết)
      message: response.message || 'Internal server error', // message ngắn gọn để hiển thị
    });
  }
}
