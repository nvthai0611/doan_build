import { useQuery } from '@tanstack/react-query'
import { leaveRequestsService } from '../../../../../services/center-owner/leave-requests/leave-requests.service'

interface UseLeaveRequestsParams {
  teacherId: string
  status?: string
  search?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export const useLeaveRequestsQuery = ({
  teacherId,
  status = 'all',
  search = '',
  fromDate = '',
  toDate = '',
  page = 1,
  limit = 10
}: UseLeaveRequestsParams) => {
  return useQuery({
    queryKey: ['leave-requests', teacherId, status, search, fromDate, toDate, page, limit],
    queryFn: async () => {
      const response = await leaveRequestsService.getTeacherLeaveRequests({
        teacherId,
        status,
        search,
        fromDate,
        toDate,
        page,
        limit
      })
      return response
    },
    enabled: !!teacherId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
