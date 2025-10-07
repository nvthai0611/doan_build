import { apiClient } from '../../../utils/clientAxios'


class LeaveRequestsService {
  // Lấy danh sách đơn xin nghỉ của giáo viên
  async getTeacherLeaveRequests(params: any): Promise<any> {
    try {
      const response = await apiClient.get(`/admin-center/leave-requests`, params)
      
      return response 
    } catch (error) {
      console.error('Error fetching teacher leave requests:', error)
      throw error
    }
  }

  // Duyệt/từ chối đơn xin nghỉ
    async approveLeaveRequest(leaveRequestId: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
    try {
      const response = await apiClient.patch(`/admin-center/leave-requests/${leaveRequestId}/${action}`, {
        notes
      })
      return response.data
    } catch (error) {
      console.error('Error approving/rejecting leave request:', error)
      throw error
    }
  }

  // Lấy thống kê đơn xin nghỉ
  async getLeaveRequestStats(teacherId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/admin-center/leave-requests/teacher/${teacherId}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching leave request stats:', error)
      throw error
    }
  }
}

export const leaveRequestsService = new LeaveRequestsService()
