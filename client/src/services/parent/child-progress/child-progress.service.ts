import { apiClient } from '../../common/api/api-client'
import type { ProgressReportDto } from './child-progress.types'

export const parentChildProgressReportService = {
	async getProgressReports(studentId: string, params?: { periodLabel?: string }): Promise<ProgressReportDto[]> {
		const response = await apiClient.get(`/parent/children/${studentId}/progress-reports`, params as any)
		// Backend wraps as { data, message }
		return (response as any)?.data?.data ?? (response as any)?.data ?? []
	},
}

