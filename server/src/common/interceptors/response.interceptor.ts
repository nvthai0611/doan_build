import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse {
  [key: string]: any; // Allow any fields from service
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
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Trường hợp 1: controller tự return dạng object { data, message?, meta?, ... }
        if (result && typeof result === 'object' && 'data' in result) {
          // Serialize tất cả các fields trong result
          const serializedResult: any = {};
          for (const key of Object.keys(result)) {
            serializedResult[key] = serializeForJson(result[key]);
          }
          
          return {
            success: true,
            status: statusCode,
            ...serializedResult, // Giữ lại TẤT CẢ fields từ service (data, message, meta, warning, sessionsGenerated, etc.)
          };
        }

        // Trường hợp 2: controller return "thô" (string/number/array/object không có field `data`)
        return {
          success: true,
          status: statusCode,
          data: serializeForJson(result),
          meta: {},
          message: '',
        };
      }),
    );
  }
}
