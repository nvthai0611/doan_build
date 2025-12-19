export declare const AUDIT_ACTION_FILTER: readonly ["create", "update", "delete", "login", "logout", "all"];
export declare const AUDIT_SORT_FIELDS: readonly ["timestamp", "action", "tableName"];
export type AuditActionFilter = (typeof AUDIT_ACTION_FILTER)[number];
export type AuditSortField = (typeof AUDIT_SORT_FIELDS)[number];
export declare class QueryAuditLogDto {
    search?: string;
    action?: AuditActionFilter;
    tableName?: string;
    userId?: string;
    recordId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: AuditSortField;
    sortOrder?: 'asc' | 'desc';
}
