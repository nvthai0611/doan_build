import { AuditLogService } from '../services/audit-log.service';
import { QueryAuditLogDto } from '../dto/audit-log/query-audit-log.dto';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getAuditLogs(query: QueryAuditLogDto): Promise<{
        data: {
            id: string;
            userId: string;
            action: string;
            tableName: string;
            recordId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            ipAddress: string;
            userAgent: string;
            timestamp: Date;
            performedBy: {
                role: string;
                email: string;
                fullName: string;
                avatar: string;
                username: string;
                id: string;
            };
        }[];
        meta: {
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
        message: string;
    }>;
    getAuditLogById(id: string): Promise<{
        data: {
            id: string;
            userId: string;
            action: string;
            tableName: string;
            recordId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            ipAddress: string;
            userAgent: string;
            timestamp: Date;
            performedBy: {
                role: string;
                email: string;
                fullName: string;
                avatar: string;
                username: string;
                id: string;
            };
        };
        message: string;
    }>;
}
