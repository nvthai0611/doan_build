import { apiClient } from '../../common/api/api-client'
import { GetStudentMaterialsParams, StudentMaterialsResponse } from './materials.types'

export const studentMaterialsService = {
  async list(params: GetStudentMaterialsParams = {}): Promise<StudentMaterialsResponse> {
    const response = await apiClient.get<StudentMaterialsResponse>(
      '/student/materials',
      { params }
    )
    const fallback: StudentMaterialsResponse = {
      items: [],
      meta: { total: 0, page: 1, limit: params.limit ?? 20, totalPages: 0 },
      stats: { totalSize: 0, totalDownloads: 0, recentUploads: 0 },
    }
    return response?.data ?? fallback
  },

  async markDownload(id: number): Promise<void> {
    await apiClient.post(`/student/materials/${id}/download`)
  }
}


