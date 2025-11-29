import { apiClient } from '@/utils/clientAxios'
import { FinancialSummary } from './financial-reports.types'

class FinancialReportsService {
  async getSummary(params?: { month?: string; year?: string }): Promise<FinancialSummary> {
    const res = await apiClient.get('/admin-center/financial-reports/summary', params)
    return res.data as FinancialSummary
  }
}

export const financialReportsService = new FinancialReportsService()
