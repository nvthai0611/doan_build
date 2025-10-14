import { apiClient } from '../../../utils/clientAxios'
import type { AdminIncidentListResponse } from './incident.types'

export const adminIncidentService = {
  async list(params?: { page?: number; limit?: number; status?: string; severity?: string }) {
    return await apiClient.get<AdminIncidentListResponse>('/admin-center/incident-handle', params)
  },

  async updateStatus(id: string, status: 'pending' | 'processing' | 'resolved' | string) {
    return await apiClient.patch<{ data: any; message: string }>(`/admin-center/incident-handle/${id}/status`, {
      status,
    })
  },
}


