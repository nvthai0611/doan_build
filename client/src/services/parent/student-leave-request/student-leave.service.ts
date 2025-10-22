import { apiClient } from '../../../utils/clientAxios'
import type { 
  StudentLeaveRequest, 
  CreateStudentLeaveRequestDto, 
  UpdateStudentLeaveRequestDto,
  GetStudentLeaveRequestsParams,
  StudentLeaveRequestResponse,
  ChildClass
} from './student-leave.types'

class ParentStudentLeaveRequestService {
  /**
   * Lấy danh sách đơn nghỉ học của học sinh
   */
  async getStudentLeaveRequests(params: GetStudentLeaveRequestsParams): Promise<StudentLeaveRequestResponse> {
    const response = await apiClient.get<{
      success: boolean
      data: {
        data: StudentLeaveRequest[]
        meta: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>('/parent/student-leave-requests', params)

    const payload: any = response as any
    const serverData = payload?.data?.data || payload?.data
    const serverMeta = payload?.data?.meta || payload?.meta
    
    return {
      data: serverData || [],
      meta: serverMeta || { total: 0, page: 1, limit: 10, totalPages: 0 }
    }
  }

  /**
   * Lấy chi tiết một đơn nghỉ học
   */
  async getStudentLeaveRequestById(id: string): Promise<StudentLeaveRequest> {
    const response = await apiClient.get<{ data: StudentLeaveRequest }>(
      `/parent/student-leave-requests/${id}`
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as StudentLeaveRequest
  }

  /**
   * Tạo đơn nghỉ học mới cho học sinh
   */
  async createStudentLeaveRequest(data: CreateStudentLeaveRequestDto): Promise<StudentLeaveRequest> {
    const response = await apiClient.post<{ data: StudentLeaveRequest }>(
      '/parent/student-leave-requests',
      data
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as StudentLeaveRequest
  }

  /**
   * Cập nhật đơn nghỉ học
   */
  async updateStudentLeaveRequest(id: string, data: UpdateStudentLeaveRequestDto): Promise<StudentLeaveRequest> {
    const response = await apiClient.put<{ data: StudentLeaveRequest }>(
      `/parent/student-leave-requests/${id}`,
      data
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as StudentLeaveRequest
  }

  /**
   * Hủy đơn nghỉ học
   */
  async cancelStudentLeaveRequest(id: string): Promise<void> {
    await apiClient.delete(`/parent/student-leave-requests/${id}`)
  }

  /**
   * Lấy danh sách lớp học của con
   */
  async getChildClasses(studentId: string): Promise<ChildClass[]> {
    const response = await apiClient.get<{ data: ChildClass[] }>(
      `/parent/students/${studentId}/classes`
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as ChildClass[]
  }

  /**
   * Lấy các buổi học sẽ bị ảnh hưởng trong khoảng thời gian nghỉ
   */
  async getAffectedSessions(params: {
    studentId: string
    classId: string
    startDate: string
    endDate: string
  }): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>(
      '/parent/student-leave-requests/affected-sessions',
      params
    )

    const payload: any = response as any
    const serverData = payload?.data?.data ?? payload?.data
    return serverData as any[]
  }
}

export const parentStudentLeaveRequestService = new ParentStudentLeaveRequestService()

