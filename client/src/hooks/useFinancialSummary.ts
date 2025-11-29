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
    staleTime: 60_000,
    refetchOnWindowFocus: false
  })

  return { summary: data, isLoading, isError, refetch }
}
