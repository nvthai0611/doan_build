import { apiClient } from '../../../utils/clientAxios'

export interface TeacherProgressReportDto {
  id: string
  periodLabel: string
  averageScore?: number | null
  attendanceRate?: number | null
  trend?: string | null
  overallComment?: string | null
  status: string
  class?: { id: string; name?: string; subject?: { name?: string | null } | null } | null
  student?: { id: string; studentCode?: string | null; user?: { fullName?: string | null } | null } | null
}

export const teacherProgressService = {
  async list(params: { status?: string; periodLabel?: string } = {}) {
    const res = await apiClient.get<{ data: TeacherProgressReportDto[] }>(
      '/teacher/progress-reports',
      params
    )
    return res.data
  },

  async updateDraft(id: string, data: { overallComment?: string }) {
    const res = await apiClient.patch<{ data: TeacherProgressReportDto }>(
      `/teacher/progress-reports/${id}`,
      data
    )
    return res.data
  },

  async publish(id: string, data: { overallComment?: string } = {}) {
    const res = await apiClient.patch<{ data: TeacherProgressReportDto }>(
      `/teacher/progress-reports/${id}/publish`,
      data
    )
    return res.data
  },

  async bulkPublish(reportIds: string[]) {
    const res = await apiClient.patch<{ data: any; message: string }>(
      '/teacher/progress-reports/bulk-publish',
      { reportIds }
    )
    return res.data
  },
}
