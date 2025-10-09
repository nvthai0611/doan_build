import { ApiService } from "../../common/api/api-client"
import type { 
  TeacherClass,
  ClassQueryParams,
  ClassResponse,
  ClassStats,
  ClassStudent,
  ClassSession,
  ClassAttendance,
  ClassMaterial,
  ClassAssessment,
  AssessmentGrade,
  ClassRequest,
  CreateClassRequest,
  UpdateClassRequest,
  EnrollStudentRequest,
  CreateSessionRequest,
  CreateAssessmentRequest,
  GradeAssessmentRequest
} from "./class.types"

export const teacherClassService = {
  // ===== Class Management =====
  
  /**
   * Lấy danh sách lớp học của giáo viên
   */
  getClasses: async (params?: ClassQueryParams): Promise<ClassResponse> => {
    const response = await ApiService.get<ClassResponse>("/teacher/class-management/classes", params)
    return response.data as any 
  },

  /**
   * Lấy thông tin chi tiết lớp học
   */
  getClassById: async (classId: string): Promise<TeacherClass> => {
    const response = await ApiService.get<TeacherClass>(`/teacher/class-management/classes/${classId}`)
    return response.data as any
  },

  /**
   * Tạo lớp học mới
   */
  createClass: async (data: CreateClassRequest): Promise<TeacherClass> => {
    const response = await ApiService.post<TeacherClass>("/teacher/class-management/classes", data)
    return response.data as any
  },

  /**
   * Cập nhật lớp học
   */
  updateClass: async (classId: string, data: Partial<CreateClassRequest>): Promise<TeacherClass> => {
    const response = await ApiService.patch<TeacherClass>(`/teacher/class-management/classes/${classId}`, data)
    return response.data as any
  },

  /**
   * Xóa lớp học
   */
  deleteClass: async (classId: string): Promise<void> => {
    await ApiService.delete(`/teacher/class-management/classes/${classId}`)
  },

  /**
   * Lấy thống kê lớp học
   */
  getClassStats: async (): Promise<ClassStats> => {
    const response = await ApiService.get<ClassStats>("/teacher/class-management/stats")
    return response.data as any
  },

  // ===== Class Students =====

  /**
   * Lấy danh sách học sinh trong lớp
   */
  getClassStudents: async (classId: string): Promise<ClassStudent[]> => {
    const response = await ApiService.get<ClassStudent[]>(`/teacher/class-management/classes/${classId}/students`)
    return response.data as any
  },

  /**
   * Đăng ký học sinh vào lớp
   */
  enrollStudent: async (data: EnrollStudentRequest): Promise<ClassStudent> => {
    const response = await ApiService.post<ClassStudent>("/teacher/class-management/enrollments", data)
    return response.data as any
  },

  /**
   * Hủy đăng ký học sinh khỏi lớp
   */
  unenrollStudent: async (classId: string, studentId: string): Promise<void> => {
    await ApiService.delete(`/teacher/class-management/classes/${classId}/students/${studentId}`)
  },

  /**
   * Lấy thông tin chi tiết học sinh trong lớp
   */
  getClassStudentById: async (classId: string, studentId: string): Promise<ClassStudent> => {
    const response = await ApiService.get<ClassStudent>(`/teacher/class-management/classes/${classId}/students/${studentId}`)
    return response.data as any
  },

  // ===== Class Sessions =====

  /**
   * Lấy danh sách buổi học của lớp
   */
  getClassSessions: async (classId: string, startDate?: string, endDate?: string): Promise<ClassSession[]> => {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await ApiService.get<ClassSession[]>(`/teacher/class-management/classes/${classId}/sessions`, params)
    return response.data as any
  },

  /**
   * Tạo buổi học mới
   */
  createSession: async (data: CreateSessionRequest): Promise<ClassSession> => {
    const response = await ApiService.post<ClassSession>("/teacher/class-management/sessions", data)
    return response.data as any
  },

  /**
   * Cập nhật buổi học
   */
  updateSession: async (sessionId: string, data: Partial<CreateSessionRequest>): Promise<ClassSession> => {
    const response = await ApiService.patch<ClassSession>(`/teacher/class-management/sessions/${sessionId}`, data)
    return response.data as any
  },

  /**
   * Xóa buổi học
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await ApiService.delete(`/teacher/class-management/sessions/${sessionId}`)
  },

  /**
   * Lấy chi tiết buổi học
   */
  getSessionById: async (sessionId: string): Promise<ClassSession> => {
    const response = await ApiService.get<ClassSession>(`/teacher/class-management/sessions/${sessionId}`)
    return response.data as any
  },

  // ===== Attendance Management =====

  /**
   * Lấy danh sách điểm danh của buổi học
   */
  getSessionAttendance: async (sessionId: string): Promise<ClassAttendance[]> => {
    const response = await ApiService.get<ClassAttendance[]>(`/teacher/class-management/sessions/${sessionId}/attendance`)
    return response.data as any
  },

  /**
   * Cập nhật điểm danh
   */
  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late", note?: string): Promise<ClassAttendance> => {
    const response = await ApiService.patch<ClassAttendance>(`/teacher/class-management/sessions/${sessionId}/attendance`, {
      studentId,
      status,
      note
    })
    return response.data as any
  },

  /**
   * Cập nhật điểm danh hàng loạt
   */
  updateBulkAttendance: async (sessionId: string, attendances: Array<{ studentId: string; status: "present" | "absent" | "late"; note?: string }>): Promise<ClassAttendance[]> => {
    const response = await ApiService.patch<ClassAttendance[]>(`/teacher/class-management/sessions/${sessionId}/attendance/bulk`, {
      attendances
    })
    return response.data as any     
  },

  // ===== Class Materials =====

  /**
   * Lấy danh sách tài liệu của lớp
   */
  getClassMaterials: async (classId: string): Promise<ClassMaterial[]> => {
    const response = await ApiService.get<ClassMaterial[]>(`/teacher/class-management/classes/${classId}/materials`)
    return response.data as any
  },

  /**
   * Tải lên tài liệu
   */
  uploadMaterial: async (classId: string, file: File, title: string, description?: string): Promise<ClassMaterial> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    if (description) formData.append("description", description)
    
    const response = await ApiService.uploadFile<ClassMaterial>(`/teacher/class-management/classes/${classId}/materials`, file, {
      title,
      description
    })
    return response.data as any as ClassMaterial
  },

  /**
   * Xóa tài liệu
   */
  deleteMaterial: async (materialId: string): Promise<void> => {
    await ApiService.delete(`/teacher/class-management/materials/${materialId}`)
  },

  // ===== Class Assessments =====

  /**
   * Lấy danh sách bài kiểm tra của lớp
   */
  getClassAssessments: async (classId: string): Promise<ClassAssessment[]> => {
    const response = await ApiService.get<ClassAssessment[]>(`/teacher/class-management/classes/${classId}/assessments`)
    return response.data as any as ClassAssessment[]
  },

  /**
   * Tạo bài kiểm tra mới
   */
  createAssessment: async (data: CreateAssessmentRequest): Promise<ClassAssessment> => {
    const response = await ApiService.post<ClassAssessment>("/teacher/class-management/assessments", data)
    return response.data as any as ClassAssessment
  },

  /**
   * Cập nhật bài kiểm tra
   */
  updateAssessment: async (assessmentId: string, data: Partial<CreateAssessmentRequest>): Promise<ClassAssessment> => {
    const response = await ApiService.patch<ClassAssessment>(`/teacher/class-management/assessments/${assessmentId}`, data)
    return response.data as any as ClassAssessment
  },

  /**
   * Xóa bài kiểm tra
   */
  deleteAssessment: async (assessmentId: string): Promise<void> => {
    await ApiService.delete(`/teacher/class-management/assessments/${assessmentId}`)
  },

  /**
   * Chấm điểm bài kiểm tra
   */
  gradeAssessment: async (data: GradeAssessmentRequest): Promise<AssessmentGrade> => {
    const response = await ApiService.post<AssessmentGrade>("/teacher/class-management/grades", data)
    return response.data as any as AssessmentGrade
  },

  /**
   * Lấy điểm số của bài kiểm tra
   */
  getAssessmentGrades: async (assessmentId: string): Promise<AssessmentGrade[]> => {
    const response = await ApiService.get<AssessmentGrade[]>(`/teacher/class-management/assessments/${assessmentId}/grades`)
    return response.data as any as AssessmentGrade[]
  },

  // ===== Class Requests =====

  /**
   * Lấy danh sách yêu cầu đăng ký lớp
   */
  getClassRequests: async (classId?: string): Promise<ClassRequest[]> => {
    const params = classId ? { classId } : {}
    const response = await ApiService.get<ClassRequest[]>("/teacher/class-management/requests", params)
    return response.data as any as ClassRequest[]
  },

  /**
   * Xử lý yêu cầu đăng ký lớp
   */
  processClassRequest: async (requestId: string, action: "approve" | "reject", message?: string): Promise<void> => {
    await ApiService.patch(`/teacher/class-management/requests/${requestId}/process`, {
      action,
      message
    })
  }
}
