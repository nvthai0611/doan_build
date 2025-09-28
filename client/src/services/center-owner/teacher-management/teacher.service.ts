import { ApiService } from "../../common/api/api-client"
import type { 
  CreateTeacherRequest, 
  UpdateTeacherRequest, 
  TeacherQueryParams, 
  TeacherResponse, 
  Teacher,
  TeacherStats,
  TeacherImportResult,
  TeacherExportOptions
} from "./teacher.types"

export const centerOwnerTeacherService = {
  // ===== CRUD Operations =====
  
  /**
   * Lấy danh sách giáo viên với phân trang và filter
   */
  getTeachers: async (params?: TeacherQueryParams): Promise<TeacherResponse> => {
    const response = await ApiService.get<TeacherResponse>("/admin-center/teacher-management", params)
    return response.data
  },

  /**
   * Lấy thông tin chi tiết giáo viên theo ID
   */
  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await ApiService.get<Teacher>(`/admin-center/teacher-management/${id}`)
    console.log("📡 API Response:", response)
    return response.data
  },

  /**
   * Tạo giáo viên mới
   */
  createTeacher: async (data: CreateTeacherRequest): Promise<Teacher> => {
    const response = await ApiService.post<Teacher>("/admin-center/teacher-management", data)
    console.log("📡 API Response:", response)
    return response.data
  },

  /**
   * Cập nhật thông tin giáo viên
   */
  updateTeacher: async (id: string, data: Partial<CreateTeacherRequest>): Promise<Teacher> => {
    const response = await ApiService.patch<Teacher>(`/admin-center/teacher-management/${id}`, data)
    console.log("API Response:", response)
    return response.data
  },

  /**
   * Xóa giáo viên
   */
  deleteTeacher: async (id: string): Promise<void> => {
    await ApiService.delete(`/admin-center/teacher-management/${id}`)
  },

  // ===== Business Operations =====

  /**
   * Toggle trạng thái hoạt động của giáo viên
   */
  toggleTeacherStatus: async (id: string): Promise<Teacher> => {
    const response = await ApiService.patch<Teacher>(`/admin-center/teacher-management/${id}/toggle-status`)
    console.log("📡 API Response:", response)
    return response.data
  },

  /**
   * Lấy thống kê giáo viên
   */
  getTeacherStats: async (): Promise<TeacherStats> => {
    const response = await ApiService.get<TeacherStats>("/admin-center/teacher-management/stats")
    return response.data
  },

  /**
   * Lấy lịch dạy của giáo viên
   */
  getTeacherSchedule: async (teacherId: string, year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()
    
    const response = await ApiService.get(`/admin-center/teacher-management/${teacherId}/schedule`, params)
    return response.data
  },

  /**
   * Cập nhật điểm danh cho học sinh
   */
  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
    const response = await ApiService.patch(`/admin-center/sessions/${sessionId}/attendance`, {
      studentId,
      status,
    })
    console.log("📡 Attendance API Response:", response)
    return response.data
  },

  /**
   * Tạo buổi học mới
   */
  createSession: async (sessionData: any) => {
    const response = await ApiService.post("/admin-center/sessions", sessionData)
    console.log("📡 Create Session API Response:", response)
    return response.data
  },

  // ===== File Operations =====

  /**
   * Tải xuống template Excel cho import giáo viên
   */
  downloadTemplate: async (): Promise<Blob> => {
    return await ApiService.downloadExcel("/admin-center/teacher-management/template")
  },

  /**
   * Tải lên file Excel để import nhiều giáo viên
   */
  uploadTeachers: async (file: File): Promise<TeacherImportResult> => {
    const response = await ApiService.uploadFile<TeacherImportResult>("/admin-center/teacher-management/upload", file)
    console.log("📡 API Response:", response)
    return response.data
  },

  /**
   * Tải xuống tất cả dữ liệu giáo viên dưới dạng Excel
   */
  downloadAllTeachers: async (options?: TeacherExportOptions): Promise<Blob> => {
    const params = options ? { ...options } : {}
    return await ApiService.downloadExcel("/admin-center/teacher-management/export", params)
  },

  // ===== Advanced Operations =====

  /**
   * Gán môn học cho giáo viên
   */
  assignSubjects: async (teacherId: string, subjects: string[]): Promise<Teacher> => {
    const response = await ApiService.patch<Teacher>(`/admin-center/teacher-management/${teacherId}/subjects`, { subjects })
    return response.data
  },

  /**
   * Cập nhật lương giáo viên
   */
  updateSalary: async (teacherId: string, salary: number): Promise<Teacher> => {
    const response = await ApiService.patch<Teacher>(`/admin-center/teacher-management/${teacherId}/salary`, { salary })
    return response.data
  },

  /**
   * Gia hạn hợp đồng
   */
  extendContract: async (teacherId: string, newEndDate: string): Promise<Teacher> => {
    const response = await ApiService.patch<Teacher>(`/admin-center/teacher-management/${teacherId}/contract`, { 
      contractEnd: newEndDate 
    })
    return response.data
  },

  /**
   * Lấy lịch sử hoạt động của giáo viên
   */
  getTeacherActivityLog: async (teacherId: string, page?: number, limit?: number) => {
    const params = { page, limit }
    const response = await ApiService.get(`/admin-center/teacher-management/${teacherId}/activity-log`, params)
    return response.data
  }
}
