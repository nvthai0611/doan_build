import { ApiService } from "../../common/api/api-client"
import type { 
  CreateStudentRequest, 
  UpdateStudentRequest, 
  StudentQueryParams, 
  StudentResponse, 
  Student,
  StudentStats,
  StudentImportResult,
  StudentExportOptions
} from "./student.types"

export const centerOwnerStudentService = {
  // ===== CRUD Operations =====
  
  /**
   * Lấy danh sách học sinh với phân trang và filter
   */
  getStudents: async (params?: StudentQueryParams): Promise<StudentResponse> => {
    const response = await ApiService.get<StudentResponse>("/admin-center/student-management", params)
    return response.data as StudentResponse
  },

  /**
   * Lấy thông tin chi tiết học sinh theo ID
   */
  getStudentById: async (id: string): Promise<Student> => {
    const response = await ApiService.get<Student>(`/admin-center/student-management/${id}`)
    console.log("📡 API Response:", response)
    return response.data as Student
  },

  /**
   * Tạo học sinh mới
   */
  createStudent: async (data: CreateStudentRequest): Promise<Student> => {
    const response = await ApiService.post<Student>("/admin-center/student-management", data)
    console.log("📡 API Response:", response)
    return response.data as Student
  },

  /**
   * Cập nhật thông tin học sinh
   */
  updateStudent: async (id: string, data: Partial<CreateStudentRequest>): Promise<Student> => {
    const response = await ApiService.patch<Student>(`/admin-center/student-management/${id}`, data)
    console.log("API Response:", response)
    return response.data as Student
  },

  /**
   * Xóa học sinh
   */
  deleteStudent: async (id: string): Promise<void> => {
    await ApiService.delete(`/admin-center/student-management/${id}`)
  },

  // ===== Business Operations =====

  /**
   * Toggle trạng thái hoạt động của học sinh
   */
  toggleStudentStatus: async (id: string): Promise<Student> => {
    const response = await ApiService.patch<Student>(`/admin-center/student-management/${id}/toggle-status`)
    console.log("📡 API Response:", response)
    return response.data as Student
  },

  /**
   * Lấy thống kê học sinh
   */
  getStudentStats: async (): Promise<StudentStats> => {
    const response = await ApiService.get<StudentStats>("/admin-center/student-management/stats")
    return response.data as StudentStats
  },

  /**
   * Lấy lịch học của học sinh
   */
  getStudentSchedule: async (studentId: string, year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()
    
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/schedule`, params)
    return response.data as any
  },

  /**
   * Lấy điểm số của học sinh
   */
  getStudentGrades: async (studentId: string, classId?: string) => {
    const params = classId ? { classId } : {}
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/grades`, params)
    return response.data as any
  },

  /**
   * Lấy lịch sử điểm danh của học sinh
   */
  getStudentAttendance: async (studentId: string, classId?: string, startDate?: string, endDate?: string) => {
    const params: any = {}
    if (classId) params.classId = classId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/attendance`, params)
    return response.data as any
  },

  /**
   * Lấy lịch sử thanh toán của học sinh
   */
  getStudentPayments: async (studentId: string) => {
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/payments`)
    return response.data as any
  },

  // ===== Enrollment Management =====

  /**
   * Đăng ký học sinh vào lớp
   */
  enrollStudent: async (studentId: string, classId: string): Promise<any> => {
    const response = await ApiService.post("/admin-center/student-management/enroll", {
      studentId,
      classId
    })
    return response.data as any
  },

  /**
   * Hủy đăng ký học sinh khỏi lớp
   */
  unenrollStudent: async (studentId: string, classId: string): Promise<void> => {
    await ApiService.delete(`/admin-center/student-management/${studentId}/enrollments/${classId}`)
  },

  /**
   * Lấy danh sách lớp học sinh đã đăng ký
   */
  getStudentEnrollments: async (studentId: string) => {
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/enrollments`)
    return response.data as any     
  },

  // ===== Parent Management =====

  /**
   * Liên kết phụ huynh với học sinh
   */
  linkParent: async (studentId: string, parentId: string, relation?: string, primaryContact: boolean = false): Promise<any> => {
    const response = await ApiService.post("/admin-center/student-management/parent-link", {
      studentId,
      parentId,
      relation,
      primaryContact
    })
    return response.data as any
  },

  /**
   * Hủy liên kết phụ huynh với học sinh
   */
  unlinkParent: async (studentId: string, parentId: string): Promise<void> => {
    await ApiService.delete(`/admin-center/student-management/${studentId}/parent-links/${parentId}`)
  },

  /**
   * Lấy danh sách phụ huynh của học sinh
   */
  getStudentParents: async (studentId: string) => {
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/parents`)
    return response.data as any
  },

  // ===== File Operations =====

  /**
   * Tải xuống template Excel cho import học sinh
   */
  downloadTemplate: async (): Promise<Blob> => {
    return await ApiService.downloadExcel("/admin-center/student-management/template")
  },

  /**
   * Tải lên file Excel để import nhiều học sinh
   */
  uploadStudents: async (file: File): Promise<StudentImportResult> => {
    const response = await ApiService.uploadFile<StudentImportResult>("/admin-center/student-management/upload", file)
    console.log("📡 API Response:", response)
    return response.data as StudentImportResult
  },

  /**
   * Tải xuống tất cả dữ liệu học sinh dưới dạng Excel
   */
  downloadAllStudents: async (options?: StudentExportOptions): Promise<Blob> => {
    const params = options ? { ...options } : {}
    return await ApiService.downloadExcel("/admin-center/student-management/export", params)
  },

  // ===== Advanced Operations =====

  /**
   * Tạo mã học sinh tự động
   */
  generateStudentCode: async (): Promise<string> => {
    const response = await ApiService.get<{ code: string }>("/admin-center/student-management/generate-code")
    return response.data?.code as string
  },

  /**
   * Cập nhật thông tin trường học
   */
  updateSchoolInfo: async (studentId: string, schoolId: string): Promise<Student> => {
    const response = await ApiService.patch<Student>(`/admin-center/student-management/${studentId}/school`, { schoolId })
    return response.data as Student
  },

  /**
   * Lấy báo cáo học tập của học sinh
   */
  getStudentReport: async (studentId: string, period: string) => {
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/report`, { period })
    return response.data as any
  }
}
