import { apiClient } from '../../../utils/clientAxios'
import type {
  SchoolItem,
  CreateSchoolDto,
  UpdateSchoolDto,
  SchoolsResponse,
  SchoolResponse,
} from './school.types'

const BASE_URL = '/admin-center/schools'

export const schoolService = {
  /**
   * Lấy thống kê tổng quan
   */
  getStats: async () => {
    const response = await apiClient.get<any>(`${BASE_URL}/stats`)
    return response.data?.data || response.data
  },

  /**
   * Lấy danh sách tất cả trường học
   */
  getSchools: async (): Promise<SchoolItem[]> => {
    const response = await apiClient.get<SchoolsResponse>(BASE_URL)
    return (response.data?.data || response.data || []) as SchoolItem[]
  },

  /**
   * Lấy thông tin một trường học theo ID
   */
  getSchoolById: async (id: string): Promise<SchoolItem> => {
    const response = await apiClient.get<SchoolResponse>(`${BASE_URL}/${id}`)
    return (response.data?.data || response.data) as SchoolItem
  },

  /**
   * Tạo trường học mới
   */
  createSchool: async (data: CreateSchoolDto): Promise<SchoolItem> => {
    const response = await apiClient.post<SchoolResponse>(BASE_URL, data)
    return (response.data?.data || response.data) as SchoolItem
  },

  /**
   * Cập nhật thông tin trường học
   */
  updateSchool: async (id: string, data: UpdateSchoolDto): Promise<SchoolItem> => {
    const response = await apiClient.put<SchoolResponse>(`${BASE_URL}/${id}`, data)
    return (response.data?.data || response.data) as SchoolItem
  },

  /**
   * Xóa trường học
   */
  deleteSchool: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`)
  },
}
