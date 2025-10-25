import { apiClient } from '../../common/api/api-client'
import type { StudentsResponse } from './students.types'

// ===== Parent Students Service =====

class ParentStudentsService {
  private readonly BASE_URL = '/parent/student-management'

  /**
   * Lấy danh sách con của phụ huynh
   */
  async getChildren(): Promise<StudentsResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/children`)
      return response as StudentsResponse
    } catch (error) {
      console.error('Error fetching children:', error)
      throw error
    }
  }

  /**
   * Lấy chi tiết 1 con
   */
  async getChildDetail(childId: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/children/${childId}`)
      return response
    } catch (error) {
      console.error('Error fetching child detail:', error)
      throw error
    }
  }
}

export const parentStudentsService = new ParentStudentsService()
