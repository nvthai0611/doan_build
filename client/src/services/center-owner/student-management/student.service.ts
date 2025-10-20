import { ApiService } from "../../../services/common"
import { apiClient } from "../../../utils/clientAxios"
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
  
class StudentService {

  /**
   * Lấy danh sách học sinh với phân trang và filter
   */
  async getStudents(params?: any): Promise<any> {
    const response = await apiClient.get("/admin-center/student-management", params)
    return response.data
  };

  /**
   * Lấy thông tin chi tiết học sinh theo ID
   */
  async getStudentById(id: string): Promise<any> {
    const response = await apiClient.get(`/admin-center/student-management/${id}`)
    return response
  };

  /**
   * Tạo học sinh mới
   */
  async createStudent(data: CreateStudentRequest): Promise<any> {
    const response = await apiClient.post("/admin-center/student-management", data)
    return response
  };

  /**
   * Cập nhật thông tin học sinh (full update)
   */
  async updateStudent(id: string, data: {
    fullName?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    schoolId?: string;
  }): Promise<any> {
    const response = await apiClient.put(`/admin-center/student-management/${id}`, data)
    return response.data as any
  };

  /**
   * Xóa học sinh
   */
  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`/admin-center/student-management/${id}`)
  };

  // ===== Business Operations =====

  /**
   * Toggle trạng thái hoạt động của học sinh
   */
  async toggleStudentStatus(id: string): Promise<Student> {
    const response = await apiClient.patch(`/admin-center/student-management/${id}/toggle-status`)
    return response.data as Student
  };

  /**
   * Lấy thống kê học sinh
   */
  async getStudentStats(): Promise<any> {
    const response = await apiClient.get("/admin-center/student-management/stats")
    return response
  };

  /**
   * Lấy lịch học của học sinh
   */
  async getStudentSchedule(studentId: string, year?: number, month?: number) {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()

    const response = await apiClient.get(`/admin-center/student-management/${studentId}/schedule`, params)
    return response.data as any
  };

  /**
   * Lấy điểm số của học sinh
   */
  async getStudentGrades(studentId: string, classId?: string) {
    const params = classId ? { classId } : {}
    const response = await apiClient.get(`/admin-center/student-management/${studentId}/grades`, params)
    return response.data as any
  };

  /**
   * Lấy lịch sử điểm danh của học sinh
   */
  async getStudentAttendance(studentId: string, classId?: string, startDate?: string, endDate?: string) {
    const params: any = {}
    if (classId) params.classId = classId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get(`/admin-center/student-management/${studentId}/attendance`, params)
    return response.data as any
  };

  /**
   * Lấy lịch sử thanh toán của học sinh
   */
  async getStudentPayments(studentId: string) {
    const response = await apiClient.get(`/admin-center/student-management/${studentId}/payments`)
    return response.data as any
  };

  // ===== Enrollment Management =====

  /**
   * Đăng ký học sinh vào lớp
   */
  async enrollStudent(studentId: string, classId: string): Promise<any> {
        const response = await apiClient.post("/admin-center/student-management/enroll", {
      studentId,
      classId
    })
    return response.data as any
  };

  /**
   * Hủy đăng ký học sinh khỏi lớp
   */
  async unenrollStudent(studentId: string, classId: string): Promise<void> {
    await apiClient.delete(`/admin-center/student-management/${studentId}/enrollments/${classId}`)
  };

  /**
   * Lấy danh sách lớp học sinh đã đăng ký
   */
  async getStudentEnrollments(studentId: string) {
    const response = await apiClient.get(`/admin-center/student-management/${studentId}/enrollments`)
    return response.data as any
  };

  // ===== Parent Management =====

  /**
   * Liên kết phụ huynh với học sinh
   */
  async linkParent(studentId: string, parentId: string, relation?: string, primaryContact: boolean = false): Promise<any> {
    const response = await apiClient.post("/admin-center/student-management/parent-link", {
      studentId,
      parentId,
      relation,
      primaryContact
    })
    return response.data as any
  };

  /**
   * Hủy liên kết phụ huynh với học sinh
   */
  async unlinkParent(studentId: string, parentId: string): Promise<void> {
    await apiClient.delete(`/admin-center/student-management/${studentId}/parent-links/${parentId}`)
  };

  /**
   * Lấy danh sách phụ huynh của học sinh
   */
  async getStudentParents(studentId: string) {
    const response = await apiClient.get(`/admin-center/student-management/${studentId}/parents`)
    return response.data as any
  };

  // ===== File Operations =====

  /**
   * Tải xuống template Excel cho import học sinh
   */
  async downloadTemplate(): Promise<Blob> {
    return await ApiService.downloadExcel("/admin-center/student-management/template")
  };

  /**
   * Tải lên file Excel để import nhiều học sinh
   */
  async uploadStudents(file: File): Promise<StudentImportResult> {
    const response = await ApiService.uploadFile<StudentImportResult>("/admin-center/student-management/upload", file)
    return response.data as StudentImportResult
  };

  /**
   * Tải xuống tất cả dữ liệu học sinh dưới dạng Excel
   */
  async downloadAllStudents(options?: StudentExportOptions): Promise<Blob> {
    const params = options ? { ...options } : {}
    return await ApiService.downloadExcel("/admin-center/student-management/export", params)
  };

  // ===== Advanced Operations =====

  /**
   * Tạo mã học sinh tự động
   */
  async generateStudentCode(): Promise<string> {
    const response = await ApiService.get<{ code: string }>("/admin-center/student-management/generate-code")
    return response.data?.code as string
  };

    /**
     * Cập nhật thông tin trường học
     */
    async updateSchoolInfo(studentId: string, schoolId: string): Promise<Student> {
      const response = await ApiService.patch<Student>(`/admin-center/student-management/${studentId}/school`, { schoolId })
      return response.data as Student
    };

  /**
   * Lấy báo cáo học tập của học sinh
   */
  async getStudentReport(studentId: string, period: string) {
    const response = await ApiService.get(`/admin-center/student-management/${studentId}/report`, { period })
    return response.data as any
  };

  async getSubject():Promise<any>{
    const response = await ApiService.get<any>("/subjects")
    return response.data as any
  }

  async getCountByStatus():Promise<any>{
    const response = await ApiService.get<any>("/admin-center/student-management/count-status")
    return response.data as any
  }

  async getDetailStudent(id: string): Promise<any>{
    const response = await ApiService.get(`/shared/students/${id}`)
    return response.data as any 
  }

  async updateStudentStatus(id: string, isActive: boolean): Promise<any> {
    const response = await ApiService.patch(`/admin-center/student-management/${id}/status`, { isActive })
    return response.data as any
  }

  async findParentByEmail(email: string): Promise<any> {
    const response = await ApiService.get(`/admin-center/student-management/search-parent`, { email })
    return response.data as any
  }

  async createStudentAccount(data: { fullName: string; username: string; phone?: string; gender?: string; schoolId: string; address?: string; grade?: string; parentId?: string; password?: string }): Promise<any> {
    const response = await ApiService.post("/admin-center/student-management", data)
    return response.data as any
  }

  /**
   * Cập nhật liên kết phụ huynh cho học sinh
   */
  async updateStudentParent(studentId: string, parentId: string | null): Promise<any> {
    const response = await ApiService.put<any>(`/admin-center/student-management/${studentId}/parent`, { parentId })
    return response.data as any
  };

  async getSchools(): Promise<any> {
    const response = await ApiService.get("/schools")
    return response.data as any
  }
}

export const centerOwnerStudentService = new StudentService()