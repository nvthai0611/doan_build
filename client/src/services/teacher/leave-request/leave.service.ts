import { apiClient } from '../../../utils/clientAxios'
import type { AffectedSessionItem, AffectedSessionsParams, CreateLeaveRequestDto, LeaveRequest, ReplacementTeacher, ReplacementTeachersParams } from './leave.types'

class TeacherLeaveRequestService {
  async getAffectedSessions(params: AffectedSessionsParams): Promise<AffectedSessionItem[]> {
    const response = await apiClient.get<{ data: AffectedSessionItem[] }>(
      '/teacher/leave-request/affected-sessions',
      params
    )
    // response theo ApiService.get: trả về ApiResponse<T> = axios wrapper ở client
    // Ở đây response.data là payload từ server
    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as AffectedSessionItem[]
  }

  async getReplacementTeachers(params: ReplacementTeachersParams): Promise<ReplacementTeacher[]> {
    const response = await apiClient.get<{ data: ReplacementTeacher[] }>(
      '/teacher/leave-request/replacement-teachers',
      params
    )
    
    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as ReplacementTeacher[]
  }

  async createLeaveRequest(params: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const response = await apiClient.post<{ data: LeaveRequest }>(
      '/teacher/leave-request/create-leave-request',
      params,
      {
        contentType: 'multipart/form-data',
      }
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as LeaveRequest
  }

  async getMyLeaveRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
  }): Promise<{
    data: LeaveRequest[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: LeaveRequest[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>('/teacher/leave-request/my-requests', params)

    const payload: any = response as any
    // Response structure: { success: true, data: { data: [...], meta: {...} } }
    // We need to return the inner data object, not just the array
    const serverData = payload?.data?.data || payload?.data
    const serverMeta = payload?.data?.meta || payload?.meta
    
    return {
      data: serverData || [],
      meta: serverMeta || { total: 0, page: 1, limit: 10, totalPages: 0 }
    }
  }
}

export const teacherLeaveRequestService = new TeacherLeaveRequestService()

