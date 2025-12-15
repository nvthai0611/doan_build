import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Request } from 'express';
import { AuditLogService } from 'src/modules/adminit/services/audit-log.service';
import { PrismaService } from 'src/db/prisma.service';
import JWT from 'src/utils/jwt.util';
import { AUDIT_LOG_ROUTES, TABLE_NAME_TO_MODEL_NAME } from '../constants';

/**
 * Interceptor để tự động tạo audit log cho các request
 * Sử dụng cho các endpoint đặc biệt như login, logout
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request & { user?: any; cookies?: any }>();
    const { method, url, body, ip, headers } = request;
    const user = (request as any).user;
    const cookies = request.cookies || {};

    // Debug: Log để kiểm tra
    //console.log('[AuditLog] Request:', { method, url, hasBody: !!body });

    // Chỉ log các method POST, PATCH, PUT, DELETE
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      //console.log('[AuditLog] Skipped: Method not POST/PATCH/PUT/DELETE');
      return next.handle();
    }

    // Lấy thông tin user từ nhiều nguồn
    let userId: string | null = null;

    // 1. Thử lấy từ req.user (từ guard/middleware)
    if (user?.userId) {
      userId = user.userId;
    }
    // 2. Thử lấy từ cookie (nếu user được lưu trong cookie)
    else if (cookies?.user) {
      try {
        const userFromCookie = typeof cookies.user === 'string' 
          ? JSON.parse(cookies.user) 
          : cookies.user;
        userId = userFromCookie?.id || userFromCookie?.userId || null;
      } catch {
        // Ignore parse error
      }
    }
    // 3. Thử lấy từ JWT token trong Authorization header hoặc cookie
    else {
      const token = 
        headers.authorization?.split(' ')[1] || // Bearer token
        cookies?.accessToken || 
        cookies?.access_token ||
        null;
      
      if (token) {
        try {
          const decoded = JWT.verifyAccessToken(token) as any;
          userId = decoded?.userId || null;
        } catch {
          // Ignore token verification error
        }
      }
    }

    if (!userId) {
      // Không log nếu không có user (có thể là public endpoint)
      //console.log('[AuditLog] Skipped: No userId found');
      return next.handle();
    }

    //console.log('[AuditLog] UserId found:', userId);

    // Xác định action và table name từ URL
    const action = this.getActionFromMethod(method);
    const tableName = this.getTableNameFromUrl(url);

    //console.log('[AuditLog] Action:', action, 'TableName:', tableName, 'URL:', url);

    // Bỏ qua nếu không xác định được table name
    if (!tableName) {
      //console.log('[AuditLog] Skipped: Cannot determine table name from URL');
      return next.handle();
    }

    // Lấy recordId từ params hoặc body
    const recordId = request.params?.id || body?.id || null;

    // Lấy IP và User Agent
    const ipAddress = ip || headers['x-forwarded-for'] || headers['x-real-ip'] || null;
    const userAgent = headers['user-agent'] || null;

    // Lấy oldValues TRƯỚC khi execute request (chỉ cho update và delete)
    // Tạo promise để query oldValues ngay lập tức
    const getOldValuesPromise = (async (): Promise<any> => {
      if ((action === 'update' || action === 'delete') && recordId && tableName) {
        try {
          // Map table name sang Prisma model name
          const modelMap: Record<string, string> = TABLE_NAME_TO_MODEL_NAME;

          const modelName = modelMap[tableName];
          if (!modelName) {
            return null;
          }

          // Query database để lấy old values TRƯỚC khi update/delete
          const oldRecord = await (this.prisma as any)[modelName].findUnique({
            where: { id: recordId },
          });

          return oldRecord || null;
        } catch (error) {
          // Nếu không tìm thấy hoặc lỗi, trả về null
          return null;
        }
      }
      return null;
    })();

    // Execute request và log sau khi thành công
    // Note: getOldValuesPromise đã được tạo và bắt đầu query ngay lập tức
    return next.handle().pipe(
      switchMap(async (response) => {
        try {
          // Chỉ log nếu response thành công
        //   console.log('[AuditLog] Response:', { 
        //     success: response?.success, 
        //     hasData: !!response?.data,
        //     statusCode: response?.status 
        //   });

          if (response?.success !== false) {
            // Lấy oldValues (đã query trước khi execute request)
            const fullOldValues = await getOldValuesPromise;

            // Tính toán chỉ những trường được thay đổi
            let oldValues: any = null;
            let newValues: any = null;

            if (action === 'create') {
              // Với create: newValues là tất cả data từ body/response
              newValues = response?.data || body || null;
              oldValues = null; // Không có old values cho create
            } else if (action === 'update') {
              // Với update: Chỉ lấy những trường được thay đổi
              if (fullOldValues && body && typeof body === 'object') {
                const changedFields: any = {};
                const oldChangedFields: any = {};

                // So sánh từng trường trong body với oldValues
                for (const key in body) {
                  // Bỏ qua các trường không phải data (như id, timestamps, etc.)
                  if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
                    continue;
                  }

                  const oldValue = fullOldValues[key];
                  const newValue = body[key];

                  // Chỉ lấy trường nếu giá trị thay đổi
                  if (oldValue !== newValue) {
                    oldChangedFields[key] = oldValue;
                    changedFields[key] = newValue;
                  }
                }

                // Chỉ lưu nếu có trường thay đổi
                if (Object.keys(changedFields).length > 0) {
                  oldValues = oldChangedFields;
                  newValues = changedFields;
                } else {
                  // Nếu không có trường nào thay đổi, không log
                  return of(response);
                }
              } else {
                // Fallback: Nếu không có oldValues hoặc body, lấy từ response
                newValues = response?.data || body || null;
                oldValues = fullOldValues;
              }
            } else if (action === 'delete') {
              // Với delete: oldValues là tất cả data (vì record sẽ bị xóa)
              oldValues = fullOldValues;
              newValues = null;
            }

            // console.log('[AuditLog] Creating log:', {
            //   userId,
            //   action,
            //   tableName,
            //   recordId,
            //   hasOldValues: !!oldValues,
            //   hasNewValues: !!newValues,
            // });

            await this.auditLogService.createAuditLog({
              userId,
              action,
              tableName,
              recordId: recordId?.toString() || null,
              oldValues,
              newValues,
              ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
              userAgent,
            });

            //console.log('[AuditLog] Log created successfully');
          } else {
            //console.log('[AuditLog] Skipped: Response not successful');
          }
        } catch (error) {
          // Không throw error để không ảnh hưởng đến response
          console.error('[AuditLog] Error creating log:', error);
        }
        return of(response);
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    const methodMap: Record<string, string> = {
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };
    return methodMap[method] || 'unknown';
  }

  private getTableNameFromUrl(url: string): string | null {
    // Map các route pattern thành table name
    // Ví dụ: /admin-center/user-management -> users
    // /admin-center/classes -> classes
    // Lưu ý: URL có thể có prefix /api/v1/admin-center/...
    const routeTableMap: Record<string, string> = AUDIT_LOG_ROUTES;

    // Normalize URL: loại bỏ query string và prefix
    const normalizedUrl = url.split('?')[0].toLowerCase();

    for (const [route, tableName] of Object.entries(routeTableMap)) {
      if (normalizedUrl.includes(route.toLowerCase())) {
        // Nếu tableName là null, bỏ qua (không log)
        if (tableName === null) {
          return null;
        }
        return tableName;
      }
    }

    return null;
  }
}

