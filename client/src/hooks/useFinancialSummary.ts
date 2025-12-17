"use client"

import { useQuery } from '@tanstack/react-query'
import { financialReportsService } from '@/services/center-owner/financial-reports/financial-reports.service'
import { FinancialSummary } from '@/services/center-owner/financial-reports/financial-reports.types'

interface UseFinancialSummaryParams {
  month?: string
  year?: string
}

export function useFinancialSummary(params?: UseFinancialSummaryParams) {
  const { data, isLoading, isError, refetch } = useQuery<FinancialSummary>({
    queryKey: ['financial-summary', params?.month, params?.year],
    queryFn: async () => financialReportsService.getSummary({
      month: params?.month,
      year: params?.year
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes - financial data không cần update quá thường xuyên
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false // Không refetch khi component mount lại nếu data còn fresh
  })

  return { summary: data, isLoading, isError, refetch }
}

export const useOverdueStudents = (params?: UseFinancialSummaryParams) => {
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['overdue-students', params?.month, params?.year],
    queryFn: () => financialReportsService.getOverdueStudents(params),
    enabled: true,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  })

  return { students, isLoading, error }
}

export const usePendingStudents = (params?: UseFinancialSummaryParams) => {
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['pending-students', params?.month, params?.year],
    queryFn: () => financialReportsService.getPendingStudents(params),
    enabled: true,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  })

  return { students, isLoading, error }
}

export const useClassStudentsStatus = (params?: UseFinancialSummaryParams) => {
  const { data: classesData = [], isLoading, error } = useQuery({
    queryKey: ['class-students-status', params?.month, params?.year],
    queryFn: () => financialReportsService.getClassStudentsStatus(params),
    enabled: true,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  })

  return { classesData, isLoading, error }
}
