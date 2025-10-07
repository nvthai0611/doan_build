import { apiClient } from '../utils/clientAxios'
import { ScheduleData, ScheduleFilters } from '../pages/Teacher/Teacher-schedule/utils'

export interface TeacherScheduleResponse {
  success: boolean
  data: ScheduleData[]
  message: string
  total?: number
}


class TeacherScheduleService {
  private baseUrl = '/teacher/schedule'


  // Lấy chi tiết một buổi dạy
  async getScheduleDetail(scheduleId: string): Promise<{ success: boolean; data: ScheduleData; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ScheduleData; message: string }>(`${this.baseUrl}/${scheduleId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedule detail:', error)
      throw error
    }
  }

  // Cập nhật trạng thái buổi dạy (hoàn thành/hủy)
  async updateScheduleStatus(scheduleId: string, status: 'completed' | 'cancelled', notes?: string): Promise<{ success: boolean; data: ScheduleData; message: string }> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: ScheduleData; message: string }>(`${this.baseUrl}/${scheduleId}/status`, {
        status,
        notes
      })
      return response.data
    } catch (error) {
      console.error('Error updating schedule status:', error)
      throw error
    }
  }

  // Xuất lịch dạy
  async exportSchedule(filters?: ScheduleFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type)
      }
      if (filters?.fromDate) {
        params.append('fromDate', filters.fromDate)
      }
      if (filters?.toDate) {
        params.append('toDate', filters.toDate)
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting schedule:', error)
      throw error
    }
  }

  // Lấy lịch dạy theo tuần
  async getWeeklySchedule(weekStart: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/weekly`, {
         weekStart 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching weekly schedule:', error)
      throw error
    }
  }

  // Lấy lịch dạy theo tháng
  async getMonthlySchedule(year: number, month: number): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/monthly`, {
         year, month
      })
      return response.data
    } catch (error) {
      console.error('Error fetching monthly schedule:', error)
      throw error
    }
  }
}

export const teacherScheduleService = new TeacherScheduleService()
