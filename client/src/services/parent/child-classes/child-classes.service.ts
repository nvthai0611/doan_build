import { apiClient } from '../../common/api/api-client'
import type { ChildClassesResponse, ChildClassResponse } from './child-classes.types'

// ===== Parent Child Classes Service =====

class ParentChildClassesService {
  private readonly BASE_URL = '/parent'

  /**
   * Lấy tất cả lớp học của tất cả con
   */
  async getAllChildrenClasses(): Promise<ChildClassesResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/children-classes`)
      console.log('Raw response from apiClient:', response)
      return response as ChildClassesResponse
    } catch (error) {
      console.error('Error fetching all children classes:', error)
      throw error
    }
  }

  /**
   * Lấy danh sách lớp học của một con cụ thể
   */
  async getChildClasses(studentId: string): Promise<ChildClassResponse> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/students/${studentId}/classes`)
      console.log('Raw child classes response:', response)
      return response as ChildClassResponse
    } catch (error) {
      console.error('Error fetching child classes:', error)
      throw error
    }
  }
}

export const parentChildClassesService = new ParentChildClassesService()
