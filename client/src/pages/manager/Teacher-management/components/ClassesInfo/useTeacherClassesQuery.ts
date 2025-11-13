import { useQuery } from '@tanstack/react-query'
import { classService } from '../../../../../services/center-owner/class-management/class.service'


export const useTeacherClassesQuery = ({
  teacherId,
  status = 'all',
  search = '',
  page = 1,
  limit = 10,
  includeSubstitute = false,
}: any) => {
  return useQuery({
    queryKey: ['teacher-classes', teacherId, status, search, page, limit, includeSubstitute],
    queryFn: async () => {
      const response = await classService.getClassByTeacherId(teacherId, {
        status,
        search,
        page,   
        limit,
        includeSubstitute,
      })
      return response
    },
    refetchOnWindowFocus: true, 
    refetchOnMount: true,
  })
}
