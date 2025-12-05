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
      const params = {
        status,
        search,
        page,   
        limit,
        includeSubstitute: includeSubstitute ? 'true' : 'false', // Convert boolean to string for query params
      };
      const response = await classService.getClassByTeacherId(teacherId, params);
      return response
    },
    refetchOnWindowFocus: true, 
    refetchOnMount: true,
  })
}
