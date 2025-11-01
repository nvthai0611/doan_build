import { apiClient } from '../../common/api/api-client'
import type { ParentOverviewData, ParentOverviewResponse } from './parent-overview.types'

export const parentOverviewService = {
  /**
   * Get parent overview dashboard data
   * @param date - Optional date in YYYY-MM-DD format. If not provided, returns data for today
   * @returns Parent overview data including upcoming lessons and active classes
   */
  getOverview: async (date?: string): Promise<ParentOverviewData> => {
    try {
      const params = date ? { date } : {}
      const response = await apiClient.get<ParentOverviewResponse>('/parent/overview', params)
      
      // Handle both response formats: { data: { data: ... } } and { data: ... }
      return (response as any)?.data?.data ?? (response as any)?.data
    } catch (error) {
      console.error('Error fetching parent overview:', error)
      throw error
    }
  }
}
