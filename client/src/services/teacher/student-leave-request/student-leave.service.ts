import { apiClient } from '../../../utils/clientAxios'
import type {
  TeacherStudentLeaveRequest,
  GetTeacherStudentLeaveRequestsParams,
  TeacherStudentLeaveRequestResponse,
  ApproveRejectDto,
} from './student-leave.types'

class TeacherStudentLeaveRequestService {
  /**
   * Lấy danh sách đơn nghỉ học của học sinh trong các lớp mình dạy
   */
  async getStudentLeaveRequests(
    params: GetTeacherStudentLeaveRequestsParams,
  ): Promise<TeacherStudentLeaveRequestResponse> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: {
          data: TeacherStudentLeaveRequest[]
          meta: {
            total: number
            page: number
            limit: number
            totalPages: number
          }
        }
      }>('/teacher/student-leave-requests', params)

      const raw: any = response as any
      const body: any = raw?.data ?? raw
      const data = Array.isArray(body) ? body : (body?.data ?? [])
      const meta = body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }
      const counts = body?.counts
      return { data, meta, counts }
    } catch (error) {
      console.error('❌ Error in getStudentLeaveRequests:', error)
      throw error
    }
  }

  /**
   * Lấy chi tiết đơn nghỉ học
   */
  async getStudentLeaveRequestById(
    id: string,
  ): Promise<TeacherStudentLeaveRequest> {
    const response = await apiClient.get<{ data: TeacherStudentLeaveRequest }>(
      `/teacher/student-leave-requests/${id}`,
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as TeacherStudentLeaveRequest
  }

  /**
   * Duyệt đơn nghỉ học
   */
  async approveStudentLeaveRequest(
    id: string,
    data: ApproveRejectDto,
  ): Promise<TeacherStudentLeaveRequest> {
    const response = await apiClient.patch<{ data: TeacherStudentLeaveRequest }>(
      `/teacher/student-leave-requests/${id}/approve`,
      data,
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as TeacherStudentLeaveRequest
  }

  /**
   * Từ chối đơn nghỉ học
   */
  async rejectStudentLeaveRequest(
    id: string,
    data: ApproveRejectDto,
  ): Promise<TeacherStudentLeaveRequest> {
    const response = await apiClient.patch<{ data: TeacherStudentLeaveRequest }>(
      `/teacher/student-leave-requests/${id}/reject`,
      data,
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as TeacherStudentLeaveRequest
  }
}

export const teacherStudentLeaveRequestService =
  new TeacherStudentLeaveRequestService()

