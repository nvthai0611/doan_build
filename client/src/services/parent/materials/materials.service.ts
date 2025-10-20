import { apiClient } from '../../common/api/api-client'
import type { GetParentMaterialsParams, ParentMaterialsResponse } from './materials.types'

export const parentMaterialsService = {
  async list(params: GetParentMaterialsParams): Promise<ParentMaterialsResponse> {
    const response = await apiClient.get<{ data: ParentMaterialsResponse }>(
      '/parent/materials',
      params
    )
    const fallback: ParentMaterialsResponse = {
      items: [],
      meta: { total: 0, page: params.page ?? 1, limit: params.limit ?? 20, totalPages: 0 },
      stats: { totalSize: 0, recentUploads: 0 },
    }
    return (response?.data && (response.data as any).data) ?? response?.data ?? fallback
  },

  async markDownload(id: number): Promise<void> {
    await apiClient.post(`/parent/materials/${id}/download`)
  }
}


