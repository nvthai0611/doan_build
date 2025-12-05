"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolService } from '@/services/center-owner/school-management/school.service'
import type { SchoolItem, CreateSchoolDto, UpdateSchoolDto } from '@/services/center-owner/school-management/school.types'

export type School = SchoolItem

export function useSchools() {
  const queryClient = useQueryClient()

  const statsQuery = useQuery({
    queryKey: ['school-stats'],
    queryFn: () => schoolService.getStats(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const schoolsQuery = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolService.getSchools(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const addMutation = useMutation({
    mutationFn: (data: CreateSchoolDto) => schoolService.createSchool(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolDto }) => schoolService.updateSchool(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolService.deleteSchool(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  })

  return {
    schools: Array.isArray(schoolsQuery.data) ? schoolsQuery.data : [],
    stats: statsQuery.data,
    isLoading: schoolsQuery.isLoading || statsQuery.isLoading,
    error: schoolsQuery.error || statsQuery.error,
    addSchool: addMutation.mutateAsync,
    updateSchool: (id: string, data: UpdateSchoolDto) => updateMutation.mutateAsync({ id, data }),
    deleteSchool: deleteMutation.mutateAsync,
    isAddingSchool: addMutation.isPending,
    isUpdatingSchool: updateMutation.isPending,
    isDeletingSchool: deleteMutation.isPending,
  }
}
