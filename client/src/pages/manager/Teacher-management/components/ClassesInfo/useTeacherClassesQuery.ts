import { useQuery } from '@tanstack/react-query'
import { classService } from '../../../../../services/center-owner/class-management/class.service'

interface UseTeacherClassesParams {
  teacherId: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export const useTeacherClassesQuery = ({
  teacherId,
  status = 'all',
  search = '',
  page = 1,
  limit = 10
}: UseTeacherClassesParams) => {
  return useQuery({
    queryKey: ['teacher-classes', teacherId, status, search, page, limit],
    queryFn: async () => {
      const response = await classService.getTeacherClasses({
        teacherId,
        status,
        search,
        page,   
        limit
      })
      return response
    },
    enabled: !!teacherId,
    staleTime: 30000, // Cache 30 giây
    refetchOnWindowFocus: true, // Không gọi lại khi focus window
    refetchOnMount: true, // Không gọi lại khi mount
  })
}
