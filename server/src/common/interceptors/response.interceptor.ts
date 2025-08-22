import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse {
  data: any;
  message?: string;
  meta?: Record<string, any>;
}

@Injectable() // cho phép NestJS inject class này
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  // intercept: chạy "xung quanh" handler (controller method)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // next.handle() trả về 1 Observable của giá trị mà controller return
    return next.handle().pipe(
      // map: biến đổi giá trị được emit (kết quả từ controller)
      map((result: any) => {
        // Trường hợp 1: controller tự return dạng { data, message?, meta? }
        if (result && typeof result === 'object' && 'data' in result) {
          return {
            success: true,
            // Lấy HTTP status code hiện tại (ví dụ POST mặc định là 201, GET là 200)
            status: context.switchToHttp().getResponse().statusCode,
            data: result.data, // dữ liệu chính
            meta: result.meta || {}, // thông tin phụ (phân trang, tổng, v.v.)
            message: result.message || '',
          };
        }

        // Trường hợp 2: controller return "thô" (string/number/array/object không có field `data`)
        return {
          success: true,
          status: context.switchToHttp().getResponse().statusCode,
          data: result,
          meta: {},
          message: '',
        };
      }),
    );
  }
}
