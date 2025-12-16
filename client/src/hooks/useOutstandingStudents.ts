import { useQuery } from '@tanstack/react-query'
import { financialReportsService } from '@/services/center-owner/financial-reports/financial-reports.service'
import { OutstandingStudent } from '@/services/center-owner/financial-reports/financial-reports.types'

export function useOutstandingStudents(params?: { month?: string; year?: string }) {
  const { data: students = [], isLoading, isError, refetch } = useQuery<OutstandingStudent[]>({
    queryKey: ['outstanding-students', params?.month, params?.year],
    queryFn: () => financialReportsService.getOutstandingStudents(params),
    enabled: true,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  return { students, isLoading, isError, refetch }
}
