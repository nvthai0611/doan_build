import { Teacher } from "../../../pages/manager/Teacher-management/types/teacher"
import { apiClient, type ApiResponse } from "../../../utils/clientAxios"

export interface CreateTeacherRequest {
  email: string
  fullName: string
  username: string
  phone?: string
  role: "teacher" | "admin" | "center_owner"
  contractEnd?: string
  subjects?: string[]
  salary?: number
  isActive?: boolean
  notes?: string
  // Thêm các field cho trường học và ảnh hợp đồng
  schoolName?: string
  schoolAddress?: string
  contractImage?: File | string // Accept both File and string (base64)
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  id: string
}

export interface QueryTeacherParams {
  search?: string
  role?: "teacher" | "admin" | "center_owner"
  status?: "active" | "inactive" | "all"
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  // Filter parameters
  gender?: string
  birthYear?: string
  salaryMin?: number
  salaryMax?: number
}

export interface TeacherResponse {
  data: Teacher[]
  message: string
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
  status: number
}

export const centerOwnerTeacherService = {
  // Lấy danh sách giáo viên
  getTeachers: async (params?: QueryTeacherParams): Promise<ApiResponse<TeacherResponse>> => {
    const response = await apiClient.get<TeacherResponse>("/admin-center/teachers", params);
    return response
  },

  // Lấy thông tin chi tiết giáo viên     
  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await apiClient.get<Teacher>(`/admin-center/teachers/${id}`)
    return response.data
  },

  // Tạo giáo viên mới
  createTeacher: async (data: CreateTeacherRequest | FormData): Promise<Teacher> => {
    // Kiểm tra nếu là FormData (có file upload)
    const isFormData = data instanceof FormData
    const options = isFormData ? {
      contentType: "multipart/form-data"
    } : {}
    const response = await apiClient.post<Teacher>("/admin-center/teachers", data, options)
    return response.data
  },

  // Cập nhật thông tin giáo viên
  updateTeacher: async (id: string, data: Partial<CreateTeacherRequest>): Promise<Teacher> => {
    const response = await apiClient.patch<Teacher>(`/admin-center/teachers/${id}`, data)
    return response.data
  },

  // Xóa giáo viên
  deleteTeacher: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin-center/teachers/${id}`)
  },

  // Toggle trạng thái giáo viên
  toggleTeacherStatus: async (id: string): Promise<Teacher> => {
        const response = await apiClient.patch<Teacher>(`/admin-center/teachers/${id}/toggle-status`)
    return response.data
  },

  // Tải xuống template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get("/admin-center/teachers/template", undefined, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    return response.data as Blob
  },

  // Tải lên file
  uploadTeachers: async (file: File): Promise<{ message: string; successCount: number; errorCount: number }> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post("/admin-center/teachers/upload", formData, {
      contentType: "multipart/form-data",
    })
    return response.data as { message: string; successCount: number; errorCount: number }
  },

  // Tải xuống tất cả dữ liệu
  downloadAllTeachers: async (): Promise<Blob> => {
    const response = await apiClient.get("/admin-center/teachers/export", undefined, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    return response.data as Blob
  },

  getTeacherSchedule: async (teacherId: string, year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()
      const response = await apiClient.get(`/admin-center/teachers/${teacherId}/schedule`, params)
    return response
  },

  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
    const response = await apiClient.patch(`/admin-center/teachers/${sessionId}/attendance`, {
      studentId,
      status,
    })
    return response
  },

  createSession: async (sessionData: any) => {
    const response = await apiClient.post("/admin-center/teachers", sessionData)
    return response
  },
}
