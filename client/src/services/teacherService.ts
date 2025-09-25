import { apiClient, type ApiResponse } from "../utils/clientAxios"
import type { Employee } from "../pages/manager/Teacher-management/types/teacher"

export interface CreateTeacherRequest {
  email: string
  password: string
  fullName: string
  username: string
  phone?: string
  role: "teacher" | "admin" | "center_owner"
  hireDate?: string
  contractEnd?: string
  subjects?: string[]
  salary?: number
  isActive?: boolean
  notes?: string
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
  hireDateFrom?: string
  hireDateTo?: string
}

export interface TeacherResponse {
  data: Employee[]
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

export const teacherService = {
  // Lấy danh sách giáo viên
  getTeachers: async (params?: QueryTeacherParams): Promise<ApiResponse<TeacherResponse>> => {
    const response = await apiClient.get<TeacherResponse>("/admin-center/teacher-management", params)
    return response
  },

  // Lấy thông tin chi tiết giáo viên
  getTeacherById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/admin-center/teacher-management/${id}`)
    console.log("📡 API Response:", response)
    return response.data
  },

  // Tạo giáo viên mới
  createTeacher: async (data: CreateTeacherRequest): Promise<Employee> => {
    const response = await apiClient.post<Employee>("/admin-center/teacher-management", data)
    console.log("📡 API Response:", response)

    return response.data
  },

  // Cập nhật thông tin giáo viên
  updateTeacher: async (id: string, data: Partial<CreateTeacherRequest>): Promise<Employee> => {
    const response = await apiClient.patch<Employee>(`/admin-center/teacher-management/${id}`, data)
    console.log("API Response:", response)
    return response.data
  },

  // Xóa giáo viên
  deleteTeacher: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin-center/teacher-management/${id}`)
  },

  // Toggle trạng thái giáo viên
  toggleTeacherStatus: async (id: string): Promise<Employee> => {
    const response = await apiClient.patch<Employee>(`/admin-center/teacher-management/${id}/toggle-status`)
    console.log("📡 API Response:", response)
    return response.data
  },

  // Tải xuống template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get("/admin-center/teacher-management/template", undefined, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    console.log("📡 API Response:", response)
    return response.data as Blob
  },

  // Tải lên file
  uploadTeachers: async (file: File): Promise<{ message: string; successCount: number; errorCount: number }> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post("/admin-center/teacher-management/upload", formData, {
      contentType: "multipart/form-data",
    })
    console.log("📡 API Response:", response)
    return response.data as { message: string; successCount: number; errorCount: number }
  },

  // Tải xuống tất cả dữ liệu
  downloadAllTeachers: async (): Promise<Blob> => {
    const response = await apiClient.get("/admin-center/teacher-management/export", undefined, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    console.log("📡 API Response:", response)
    return response.data as Blob
  },

  getTeacherSchedule: async (teacherId: string, year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()
    const response = await apiClient.get(`/admin-center/teacher-management/${teacherId}/schedule`, params)
    return response
  },

  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
    const response = await apiClient.patch(`/admin-center/sessions/${sessionId}/attendance`, {
      studentId,
      status,
    })
    console.log("📡 Attendance API Response:", response)
    return response
  },

  createSession: async (sessionData: any) => {
    const response = await apiClient.post("/admin-center/sessions", sessionData)
    console.log("📡 Create Session API Response:", response)
    return response
  },
}
