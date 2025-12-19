import { PrismaService } from 'src/db/prisma.service';
import { QueryAuditLogDto } from '../dto/audit-log/query-audit-log.dto';
import { Prisma } from '@prisma/client';
export interface CreateAuditLogDto {
    userId: string;
    action: 'create' | 'update' | 'delete' | string;
    tableName: string;
    recordId?: string | null;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
}
export declare class AuditLogService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAuditLogs(query: QueryAuditLogDto): Promise<{
        data: {
            id: string;
            userId: string;
            action: string;
            tableName: string;
            recordId: string;
            oldValues: Prisma.JsonValue;
            newValues: Prisma.JsonValue;
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
            oldValues: Prisma.JsonValue;
            newValues: Prisma.JsonValue;
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
    createAuditLog(dto: CreateAuditLogDto): Promise<void>;
    logCrudOperation(userId: string, action: 'create' | 'update' | 'delete', tableName: string, recordId?: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<void>;
}
