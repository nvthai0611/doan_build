import { apiClient } from '@/utils/clientAxios';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  performedBy: {
    id: string;
    username: string;
    fullName: string | null;
    email: string | null;
    avatar: string | null;
    role: string;
  };
}

export interface QueryAuditLogParams {
  page?: number;
  limit?: number;
  action?: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'all';
  tableName?: string;
  userId?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'timestamp' | 'action' | 'tableName';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface AuditLogDetailResponse {
  data: AuditLog;
  message: string;
}

const BASE_URL = '/adminit/audit-log';

export const auditLogService = {
  async getAuditLogs(params?: QueryAuditLogParams): Promise<AuditLogListResponse> {
    const response = await apiClient.get<AuditLogListResponse>(BASE_URL, params);
    return response as unknown as AuditLogListResponse;
  },

  async getAuditLogById(id: string): Promise<AuditLogDetailResponse> {
    const response = await apiClient.get<AuditLogDetailResponse>(`${BASE_URL}/${id}`);
    return response as unknown as AuditLogDetailResponse;
  },
};

