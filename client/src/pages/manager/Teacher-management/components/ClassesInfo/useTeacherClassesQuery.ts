import { useQuery } from '@tanstack/react-query'
import { classService } from '../../../../../services/center-owner/class-management/class.service'


export const useTeacherClassesQuery = ({
  teacherId,
  status = 'all',
  search = '',
  page = 1,
  limit = 10
}: any) => {
  return useQuery({
    queryKey: ['teacher-classes', teacherId, status, search, page, limit],
    queryFn: async () => {
      const response = await classService.getClassByTeacherId(teacherId, {
        status,
        search,
        page,   
        limit
      })
      return response
    },
    refetchOnWindowFocus: true, 
    refetchOnMount: true,
  })
}
