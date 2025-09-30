import { apiClient } from '../../../utils/clientAxios'
import { GetClassesParams, GetClassesResponse } from './class.types'
import { ClassStats } from './class.types'
import { Class } from './class.types'




class ClassService {
  // Lấy danh sách lớp học của giáo viên
  async getTeacherClasses(params: GetClassesParams): Promise<any> {
    try {
      const response = await apiClient.get(`/admin-center/classes/class-by-teacher`, {
        params: {
          teacherId: params.teacherId,
          status: params.status,
          search: params.search,
          page: params.page,
          limit: params.limit
        }
      })
      console.log(response);
      
      return response as any
    } catch (error) {
      console.error('Error fetching teacher classes:', error)
      throw error
    }
  }

  // Lấy thống kê lớp học của giáo viên
  async getTeacherClassStats(teacherId: string): Promise<ClassStats> {
    try {
      const response = await apiClient.get(`/admin-center/classes/class-by-teacher/stats`, {
        params: { teacherId }
      })
      return response.data as any
    } catch (error) {
      console.error('Error fetching class stats:', error)
      throw error
    }
  }

  // Lấy chi tiết lớp học
  async getClassDetails(classId: number): Promise<Class> {
    try {
      const response = await apiClient.get(`/admin-center/classes/class-by-teacher/${classId}`)
      return response.data as any
    } catch (error) {
      console.error('Error fetching class details:', error)
      throw error
    }
  }

  // Tạo lớp học mới
  async createClass(classData: Partial<Class>): Promise<Class> {
    try {
      const response = await apiClient.post(`/admin-center/classes/class-by-teacher`, classData)
      return response.data as any
    } catch (error) {
      console.error('Error creating class:', error)
      throw error
    }
  }

  // Cập nhật lớp học
  async updateClass(classId: number, classData: Partial<Class>): Promise<Class> {
    try {
      const response = await apiClient.put(`/admin-center/classes/class-by-teacher/${classId}`, classData) 
      return response.data as any
    } catch (error) {
      console.error('Error updating class:', error)
      throw error
    }
  }

  // Xóa lớp học
  async deleteClass(classId: number): Promise<void> {
    try {
      await apiClient.delete(`/admin-center/classes/class-by-teacher/${classId}`)
    } catch (error) {
      console.error('Error deleting class:', error)
      throw error
    }
  }

  // Lấy danh sách học sinh trong lớp
  async getClassStudents(classId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/admin-center/classes/class-by-teacher/${classId}/students`)
      return response.data as any[]
    } catch (error) {
      console.error('Error fetching class students:', error)
      throw error
    }
  }

  // Cập nhật trạng thái lớp học
  async updateClassStatus(classId: number, status: string): Promise<Class> {
    try {
      const response = await apiClient.patch(`/admin-center/classes/class-by-teacher/${classId}/status`, {
        status
      })
      return response.data as Class
    } catch (error) {
      console.error('Error updating class status:', error)
      throw error
    }
  }
}

export const classService = new ClassService()
