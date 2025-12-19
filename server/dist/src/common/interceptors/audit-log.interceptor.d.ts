import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditLogService } from 'src/modules/adminit/services/audit-log.service';
import { PrismaService } from 'src/db/prisma.service';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly auditLogService;
    private readonly prisma;
    constructor(auditLogService: AuditLogService, prisma: PrismaService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getActionFromMethod;
    private getTableNameFromUrl;
}
