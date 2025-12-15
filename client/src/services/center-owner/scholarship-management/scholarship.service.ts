import { apiClient } from '../../../utils/clientAxios'
import type {
  Scholarship,
  CreateScholarshipDto,
  UpdateScholarshipDto,
  ScholarshipsResponse,
  ScholarshipResponse,
  QueryScholarshipParams,
} from './scholarship.types'

const BASE_URL = '/admin-center/scholarships'

export const scholarshipService = {
  /**
   * Lấy danh sách học bổng với pagination
   */
  getScholarships: async (
    params?: QueryScholarshipParams,
  ): Promise<ScholarshipsResponse> => {
    const response = await apiClient.get<ScholarshipsResponse>(BASE_URL, params)
    return response as any
  },

  /**
   * Lấy thông tin một học bổng theo ID
   */
  getScholarshipById: async (id: string): Promise<Scholarship> => {
    const response = await apiClient.get<ScholarshipResponse>(`${BASE_URL}/${id}`)
    return (response.data?.data || response.data) as Scholarship
  },

  /**
   * Tạo học bổng mới
   */
  createScholarship: async (data: CreateScholarshipDto): Promise<Scholarship> => {
    const response = await apiClient.post<ScholarshipResponse>(BASE_URL, data)
    return (response.data?.data || response.data) as Scholarship
  },

  /**
   * Cập nhật thông tin học bổng
   */
  updateScholarship: async (
    id: string,
    data: UpdateScholarshipDto,
  ): Promise<Scholarship> => {
    const response = await apiClient.put<ScholarshipResponse>(`${BASE_URL}/${id}`, data)
    return (response.data?.data || response.data) as Scholarship
  },

  /**
   * Xóa học bổng
   */
  deleteScholarship: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`)
  },
}

