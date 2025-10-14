import { apiClient } from '../../../utils/clientAxios'
import type { IncidentReportCreateRequest, IncidentReportItem, IncidentReportListResponse } from './incident.types'

export const teacherIncidentReportService = {
  async createIncidentReport(payload: IncidentReportCreateRequest) {
    return await apiClient.post<{ data: IncidentReportItem; message: string }>(
      '/teacher/incident-report',
      payload,
    )
  },

  async getMyIncidentReports(params?: { page?: number; limit?: number; status?: string }) {
    return await apiClient.get<IncidentReportListResponse>('/teacher/incident-report', params)
  },

  async getIncidentReportDetail(id: string) {
    return await apiClient.get<{ data: IncidentReportItem; message: string }>(`/teacher/incident-report/${id}`)
  },
}


