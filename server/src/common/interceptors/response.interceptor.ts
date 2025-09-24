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

// Serialize values that JSON.stringify cannot handle (BigInt, Prisma Decimal, Date, etc.)
function serializeForJson(value: any): any {
  // BigInt -> string (safe for large ids)
  if (typeof value === 'bigint') return value.toString();

  // Null or primitive
  if (value === null || typeof value !== 'object') return value;

  // Dates -> ISO string
  if (value instanceof Date) return value.toISOString();

  // Prisma Decimal or similar objects that expose toNumber/toString
  // Convert to number (if possible), otherwise to string
  const hasToNumber = typeof (value as any).toNumber === 'function';
  const hasToString = typeof (value as any).toString === 'function';
  if (hasToNumber || (hasToString && value.constructor?.name === 'Decimal')) {
    try {
      return hasToNumber ? (value as any).toNumber() : parseFloat((value as any).toString());
    } catch {
      return (value as any).toString();
    }
  }

  // Arrays
  if (Array.isArray(value)) return value.map(serializeForJson);

  // Plain objects
  const output: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    output[key] = serializeForJson((value as any)[key]);
  }
  return output;
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
            data: serializeForJson(result.data), // dữ liệu chính
            meta: serializeForJson(result.meta || {}), // thông tin phụ (phân trang, tổng, v.v.)
            message: result.message || '',
          };
        }

        // Trường hợp 2: controller return "thô" (string/number/array/object không có field `data`)
        return {
          success: true,
          status: context.switchToHttp().getResponse().statusCode,
          data: serializeForJson(result),
          meta: {},
          message: '',
        };
      }),
    );
  }
}
