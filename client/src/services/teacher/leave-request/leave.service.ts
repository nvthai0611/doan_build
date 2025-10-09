import { apiClient } from '../../../utils/clientAxios'
import type { AffectedSessionItem, AffectedSessionsParams } from './leave.types'

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
}

export const teacherLeaveRequestService = new TeacherLeaveRequestService()

