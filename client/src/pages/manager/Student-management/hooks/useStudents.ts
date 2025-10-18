import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { centerOwnerStudentService } from "../../../../services/center-owner/student-management/student.service"
// import centerOwnerStudentService from "../../../../services/center-owner/student-management/student.service"
interface GetStudentsParams {
  status?: string
  search?: string
  birthMonth?: string
  birthYear?: string
  gender?: string
  accountStatus?: string
  customerConnection?: string
  course?: string
  page?: number
  limit?: number
}

/**
 * Hook để lấy danh sách học sinh với phân trang và filter
 */
export const useStudents = (params: GetStudentsParams = {}) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => centerOwnerStudentService.getStudents(params),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
}

/**
 * Hook để lấy thống kê học sinh theo status
 */
export const useStudentCounts = () => {
  return useQuery({
    queryKey: ['studentCounts'],
    queryFn: () => centerOwnerStudentService.getCountByStatus(),
    staleTime: 60000,
    refetchOnWindowFocus: false
  })
}

/**
 * Hook để cập nhật trạng thái của học sinh
 */
export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, isActive }: { studentId: string; isActive: boolean }) =>
      centerOwnerStudentService.updateStudentStatus(studentId, isActive),
    onSuccess: (data) => {
      toast.success(data?.message || 'Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['studentCounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi cập nhật trạng thái')
    }
  })
}

/**
 * Hook để tạo mới học sinh
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => centerOwnerStudentService.createStudentAccount(data),
    onSuccess: (data) => {
      toast.success(data?.message || 'Tạo học sinh thành công')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['studentCounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi tạo học sinh')
    }
  })
}

/**
 * Hook để cập nhật thông tin học sinh
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: any }) =>
      centerOwnerStudentService.updateStudent(studentId, data),
    onSuccess: (data) => {
      toast.success(data?.message || 'Cập nhật học sinh thành công')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi cập nhật học sinh')
    }
  })
}

/**
 * Hook để liên kết phụ huynh với học sinh
 */
export const useUpdateStudentParent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, parentId }: { studentId: string; parentId: string | null }) =>
      centerOwnerStudentService.updateStudentParent(studentId, parentId),
    onSuccess: (data) => {
      toast.success(data?.message || 'Cập nhật phụ huynh thành công')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi cập nhật phụ huynh')
    }
  })
}

/**
 * Hook để tìm kiếm phụ huynh theo email
 */
export const useSearchParentByEmail = () => {
  return useMutation({
    mutationFn: (email: string) => centerOwnerStudentService.findParentByEmail(email),
    onError: (error: any) => {
      console.error('Error searching parent:', error)
    }
  })
}

/**
 * Hook để lấy chi tiết học sinh
 */
export const useStudentDetail = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['studentDetail', studentId],
    queryFn: () => centerOwnerStudentService.getDetailStudent(studentId!),
    enabled: !!studentId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
}
  export const useToggleStudentStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (studentId: string) => centerOwnerStudentService.toggleStudentStatus(studentId),
      onSuccess: (data: any) => {
        toast.success(data?.data?.message || 'Cập nhật trạng thái thành công')
        queryClient.invalidateQueries({ queryKey: ['students'] })
        queryClient.invalidateQueries({ queryKey: ['studentCounts'] })
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Lỗi cập nhật trạng thái')
      }
    })
}