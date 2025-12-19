import { apiClient } from '@/utils/clientAxios'
import { FinancialSummary, OutstandingStudent } from './financial-reports.types'

class FinancialReportsService {
  async getSummary(params?: { month?: string; year?: string }): Promise<FinancialSummary> {
    const res = await apiClient.get('/admin-center/financial-reports/summary', params)
    return res.data as FinancialSummary
  }

  async getOutstandingStudents(params?: { month?: string; year?: string }): Promise<OutstandingStudent[]> {
    const res = await apiClient.get('/admin-center/financial-reports/outstanding-students', params)
    return res.data as OutstandingStudent[]
  }

  async getOverdueStudents(params?: { month?: string; year?: string }): Promise<OutstandingStudent[]> {
    const res = await apiClient.get('/admin-center/financial-reports/overdue-students', params)
    return res.data as OutstandingStudent[]
  }

  async getPendingStudents(params?: { month?: string; year?: string }): Promise<OutstandingStudent[]> {
    const res = await apiClient.get('/admin-center/financial-reports/pending-students', params)
    return res.data as OutstandingStudent[]
  }

  async getClassStudentsStatus(params?: { month?: string; year?: string }): Promise<any[]> {
    const res = await apiClient.get('/admin-center/financial-reports/class-students-status', params)
    return res.data as any[]
  }
}

export const financialReportsService = new FinancialReportsService()
