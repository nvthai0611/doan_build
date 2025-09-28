import { ApiResponse } from "../../types/response"
import { apiClient } from "../../utils/clientAxios"

const teacherId = "601a2029-dc56-4c2a-bc8d-440526cad471" // TODO: Lấy từ context hoặc props

export interface ClassQueryParams {
  status: string
  page?: number
  limit?: number
  searchQuery?: string
}

export interface ClassCountByStatus {
  all: number
  active: number
  completed: number
  draft: number
  cancelled: number
}

export const teacherClassService = {
  /**
   * Lấy danh sách lớp học của giáo viên
   */
  getClassesByTeacherId: async (
    status: string, 
    page: number = 1, 
    limit: number = 10,
    searchQuery?: string
  ): Promise<ApiResponse<any>> => {
    try {
      // Xây dựng query string thủ công để tránh vấn đề serialization
      const queryParams = new URLSearchParams()
      
      if (status && status !== 'undefined' && status !== 'all') {
        queryParams.append('status', status)
      }
      
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      
      // Thêm các tham số filter và search
      if (searchQuery && searchQuery.trim() !== '') {
        queryParams.append('search', searchQuery.trim())
      }
      
      const url = `/class-management/teacher/${teacherId}?${queryParams.toString()}`
      const response = await apiClient.get(url)

      // Kiểm tra status code thành công (200-299)
      if (response.status >= 200 && response.status < 300) {
        return response as ApiResponse<any>
      } else {
        const errorData: ApiResponse<any> = response.data as ApiResponse<any>
        throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      throw error
    }
  },

  /**
   * Lấy số lượng lớp học theo trạng thái
   */
  getCountByStatus: async (): Promise<ApiResponse<ClassCountByStatus>> => {
    try {
      const response = await apiClient.get(`/class-management/teacher/${teacherId}/count-by-status`)

      // Kiểm tra status code thành công (200-299)
      if (response.status >= 200 && response.status < 300) {
        return response as ApiResponse<ClassCountByStatus>
      } else {
        const errorData: ApiResponse<any> = response.data as ApiResponse<any>
        throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu')
      }
    } catch (error) {
      console.error('Error fetching class count:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết lớp học
   */
  getClassDetail: async (classId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`class-management/class/details?classId=${classId}`)
      if (response.status >= 200 && response.status < 300) {
        return response.data
      } else {
        const errorData = response.data as any
        throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu')
      }
    } catch (error) {
      console.error('Error fetching class detail:', error)
      throw error
    }
  },

  /**
   * Tạo lớp học mới
   */
  createClass: async (classData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post("/class-management/class", classData)
      if (response.status >= 200 && response.status < 300) {
        return response as ApiResponse<any>
      } else {
        const errorData: ApiResponse<any> = response.data as ApiResponse<any>
        throw new Error(errorData.message || 'Lỗi khi tạo lớp học')
      }
    } catch (error) {
      console.error('Error creating class:', error)
      throw error
    }
  },

  /**
   * Cập nhật lớp học
   */
  updateClass: async (classId: string, classData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.patch(`/class-management/class/${classId}`, classData)
      if (response.status >= 200 && response.status < 300) {
        return response as ApiResponse<any>
      } else {
        const errorData: ApiResponse<any> = response.data as ApiResponse<any>
        throw new Error(errorData.message || 'Lỗi khi cập nhật lớp học')
      }
    } catch (error) {
      console.error('Error updating class:', error)
      throw error
    }
  },

  /**
   * Xóa lớp học
   */
  deleteClass: async (classId: string): Promise<void> => {
    try {
      await apiClient.delete(`/class-management/class/${classId}`)
    } catch (error) {
      console.error('Error deleting class:', error)
      throw error
    }
  }
}
