'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { scholarshipService } from '@/services/center-owner/scholarship-management/scholarship.service'
import type {
  Scholarship,
  CreateScholarshipDto,
  UpdateScholarshipDto,
  QueryScholarshipParams,
} from '@/services/center-owner/scholarship-management/scholarship.types'

// Re-export Scholarship type để các component khác có thể dùng
export type { Scholarship }

export function useScholarships(params?: QueryScholarshipParams) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: scholarshipsResponse, isLoading, error } = useQuery({
    queryKey: ['scholarships', params],
    queryFn: async () => {
      return await scholarshipService.getScholarships(params)
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Đảm bảo scholarships luôn là mảng, ngay cả khi undefined hoặc không phải mảng
  const scholarships: Scholarship[] = Array.isArray(scholarshipsResponse?.data)
    ? scholarshipsResponse.data
    : []
  const meta = scholarshipsResponse?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  }

  const addScholarship = async (scholarshipData: CreateScholarshipDto) => {
    setIsSubmitting(true)
    try {
      const newScholarship = await scholarshipService.createScholarship(scholarshipData)
      await queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      return newScholarship
    } catch (error) {
      console.error('Error adding scholarship:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateScholarship = async (
    id: string,
    scholarshipData: UpdateScholarshipDto,
  ) => {
    setIsSubmitting(true)
    try {
      const updatedScholarship = await scholarshipService.updateScholarship(
        id,
        scholarshipData,
      )
      await queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      return updatedScholarship
    } catch (error) {
      console.error('Error updating scholarship:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteScholarship = async (id: string) => {
    setIsSubmitting(true)
    try {
      await scholarshipService.deleteScholarship(id)
      await queryClient.invalidateQueries({ queryKey: ['scholarships'] })
    } catch (error) {
      console.error('Error deleting scholarship:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    scholarships,
    meta,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    isLoading,
    isSubmitting,
    error,
  }
}

