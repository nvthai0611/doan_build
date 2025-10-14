import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { centerOwnerStudentService } from "../../../../services/center-owner/student-management/student.service"
import { toast } from "sonner"

// Hook để lấy danh sách students
export const useStudents = (params?: any) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => centerOwnerStudentService.getStudents(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}

// Hook để lấy chi tiết student
export const useStudentDetail = (id?: string) => {
  return useQuery({
    queryKey: ['student-detail', id],
    queryFn: () => centerOwnerStudentService.getDetailStudent(id!),
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}

// Hook để cập nhật status của student
export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, isActive }: { studentId: string; isActive: boolean }) =>
      centerOwnerStudentService.updateStudentStatus(studentId, isActive),
    onMutate: async ({ studentId, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['students'] })
      await queryClient.cancelQueries({ queryKey: ['student-detail', studentId] })

      // Snapshot the previous values
      const previousStudents = queryClient.getQueryData(['students'])
      const previousStudentDetail = queryClient.getQueryData(['student-detail', studentId])

      // Optimistically update students list
      queryClient.setQueryData(['students'], (old: any) => {
        if (!old?.data?.students) return old
        
        return {
          ...old,
          data: {
            ...old.data,
            students: old.data.students.map((student: any) =>
              student.id === studentId
                ? {
                    ...student,
                    user: {
                      ...student.user,
                      isActive: isActive,
                      updatedAt: new Date().toISOString()
                    }
                  }
                : student
            )
          }
        }
      })

      // Optimistically update student detail
      queryClient.setQueryData(['student-detail', studentId], (old: any) => ({
        ...old,
        user: {
          ...old?.user,
          isActive: isActive,
          updatedAt: new Date().toISOString()
        }
      }))

      return { previousStudents, previousStudentDetail }
    },
    onError: (error: any, { studentId }, context) => {
      // Rollback on error
      if (context?.previousStudents) {
        queryClient.setQueryData(['students'], context.previousStudents)
      }
      if (context?.previousStudentDetail) {
        queryClient.setQueryData(['student-detail', studentId], context.previousStudentDetail)
      }

      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi cập nhật trạng thái tài khoản'
      toast.error(errorMessage)
    },
    onSuccess: (data, { isActive }) => {
      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-detail'] })
      
      toast.success(`Tài khoản đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công`)
    }
  })
}

// Hook để toggle status của student
export const useToggleStudentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => centerOwnerStudentService.toggleStudentStatus(studentId),
    onMutate: async (studentId) => {
      await queryClient.cancelQueries({ queryKey: ['students'] })
      await queryClient.cancelQueries({ queryKey: ['student-detail', studentId] })

      const previousStudents = queryClient.getQueryData(['students'])
      const previousStudentDetail = queryClient.getQueryData(['student-detail', studentId])

      // Get current status and toggle it
      const currentStudent = queryClient.getQueryData(['student-detail', studentId]) as any
      const newStatus = !currentStudent?.user?.isActive

      // Optimistically update
      queryClient.setQueryData(['students'], (old: any) => {
        if (!old?.data?.students) return old
        
        return {
          ...old,
          data: {
            ...old.data,
            students: old.data.students.map((student: any) =>
              student.id === studentId
                ? {
                    ...student,
                    user: {
                      ...student.user,
                      isActive: newStatus,
                      updatedAt: new Date().toISOString()
                    }
                  }
                : student
            )
          }
        }
      })

      queryClient.setQueryData(['student-detail', studentId], (old: any) => ({
        ...old,
        user: {
          ...old?.user,
          isActive: newStatus,
          updatedAt: new Date().toISOString()
        }
      }))

      return { previousStudents, previousStudentDetail, newStatus }
    },
    onError: (error: any, studentId, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(['students'], context.previousStudents)
      }
      if (context?.previousStudentDetail) {
        queryClient.setQueryData(['student-detail', studentId], context.previousStudentDetail)
      }

      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi thay đổi trạng thái tài khoản'
      toast.error(errorMessage)
    },
    onSuccess: (data, studentId, context) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-detail'] })
      
      const newStatus = (data as any)?.user?.isActive ?? context?.newStatus
      toast.success(`Tài khoản đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công`)
    }
  })
}

// Hook để lấy thống kê students theo status
export const useStudentCountByStatus = () => {
  return useQuery({
    queryKey: ['student-count-by-status'],
    queryFn: () => centerOwnerStudentService.getCountByStatus(),
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  })
}