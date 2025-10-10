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
}

export const teacherLeaveRequestService = new TeacherLeaveRequestService()

