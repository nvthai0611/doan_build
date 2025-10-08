import { apiClient } from '../api/api-client'

export class SchoolService {
  private static readonly BASE_URL = '/schools'

  /**
   * Lấy danh sách tất cả trường học
   */
  static async getAllSchools(): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${this.BASE_URL}`)
      return response as any
    } catch (error) {
      console.error('Error fetching schools:', error)
      throw error
    }
  }

  /**
   * Tìm kiếm trường học theo tên
   */
  static async searchSchools(searchTerm: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${this.BASE_URL}/search`, {
        params: { q: searchTerm }
      })
      return response as any
    } catch (error) {
      console.error('Error searching schools:', error)
      throw error
    }
  }

  /**
   * Tạo trường học mới
   */
  static async createSchool(schoolData: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(`${this.BASE_URL}`, schoolData)
      return response as any
    } catch (error) {
      console.error('Error creating school:', error)
      throw error
    }
  }
}

// Export default instance
export const schoolService = SchoolService
