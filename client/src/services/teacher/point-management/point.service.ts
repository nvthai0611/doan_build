import { ApiService } from "../../common/api/api-client"
import type { 
  Assessment,
  AssessmentGradeView,
  RecordGradesPayload,
  TeacherStudentSummary,
  UpdateGradePayload,
  TeacherClassItem,
  StudentGradeDetail,
  SubjectStats,
  GradeViewFilters,
  GradeViewResponse,
  ClassSession
} from "./point.types"

export const teacherPointService = {
  // ===== Class Students Management =====
  
  /**
   * Lấy danh sách học sinh trong lớp để quản lý điểm
   */
  getClassStudents: async (classId: string): Promise<TeacherStudentSummary[]> => {
    const response = await ApiService.get<TeacherStudentSummary[]>("/teacher/grades/class-students", { classId })
    return response.data || []
  },

  // ===== Assessment Management =====

  /**
   * Lấy danh sách bài kiểm tra của lớp
   */
  getAssessments: async (classId: string): Promise<Assessment[]> => {
    const response = await ApiService.get<Assessment[]>("/teacher/grades/assessments", { classId })
    return response.data || []
  },

  /**
   * Lấy danh sách loại bài kiểm tra
   */
  getAssessmentTypes: async (classId?: string): Promise<string[]> => {
    const params = classId ? { classId } : {}
    const response = await ApiService.get<string[]>("/teacher/grades/assessment-types", params)
    return response.data || []
  },

  /**
   * Lấy cấu hình đầy đủ của exam types từ SystemSetting (bao gồm maxScore, description)
   */
  getExamTypesConfig: async (): Promise<any[]> => {
    const response = await ApiService.get<any[]>("/teacher/grades/exam-types-config")
    return response.data || []
  },

  /**
   * Lấy danh sách các buổi học đã kết thúc của lớp
   */
  getCompletedSessions: async (classId: string): Promise<ClassSession[]> => {
    const response = await ApiService.get<ClassSession[]>("/teacher/grades/completed-sessions", { classId })
    return response.data || []
  },

  /**
   * Lấy chi tiết điểm số của bài kiểm tra
   */
  getAssessmentGrades: async (assessmentId: string): Promise<AssessmentGradeView[]> => {
    const response = await ApiService.get<AssessmentGradeView[]>(`/teacher/grades/assessments/${assessmentId}/grades`)
    return response.data || []
  },

  // ===== Grade Management =====

  /**
   * Ghi điểm cho học sinh
   */
  recordGrades: async (payload: any): Promise<{ assessmentId: string }> => {
    const response = await ApiService.post<{ assessmentId: string }>("/teacher/grades/record", payload)
    return response.data || { assessmentId: '' }
  },

  /**
   * Cập nhật điểm số của học sinh
   */
  updateGrade: async (payload: UpdateGradePayload): Promise<void> => {
    await ApiService.put("/teacher/grades/update", payload)
  },

  /**
   * Xóa điểm số của học sinh
   */
  deleteGrade: async (assessmentId: string, studentId: string): Promise<void> => {
    await ApiService.delete(`/teacher/grades/assessments/${assessmentId}/students/${studentId}`)
  },

  /**
   * Lấy báo cáo điểm số của lớp
   */
  getClassGradeReport: async (classId: string): Promise<{
    classInfo: TeacherClassItem;
    students: TeacherStudentSummary[];
    assessments: Assessment[];
    averageGrade: number;
    gradeDistribution: { grade: string; count: number }[];
  }> => {
    const response = await ApiService.get<{
      classInfo: TeacherClassItem;
      students: TeacherStudentSummary[];
      assessments: Assessment[];
      averageGrade: number;
      gradeDistribution: { grade: string; count: number }[];
    }>(`/teacher/grades/classes/${classId}/report`)
    return response.data || {
      classInfo: { id: '', name: '', subject: null, studentCount: 0 },
      students: [],
      assessments: [],
      averageGrade: 0,
      gradeDistribution: []
    }
  },

  /**
   * Xuất báo cáo điểm số ra file Excel
   */
  exportGradeReport: async (classId: string, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> => {
    const response = await ApiService.get(`/teacher/grades/classes/${classId}/export`, { format })
    return response.data as Blob
  },

  // ===== Grade View Management =====

  /**
   * Lấy dữ liệu điểm số cho trang Score_view
   */
  getGradeViewData: async (filters?: GradeViewFilters): Promise<GradeViewResponse> => {
    console.log('🔍 Calling getGradeViewData with filters:', filters)
    try {
      const response = await ApiService.get<GradeViewResponse>("/teacher/grades/view", filters)
      console.log('✅ getGradeViewData response:', response)
      return response.data || {
        students: [],
        subjectStats: [],
        totalStudents: 0,
        overallAverage: 0,
        passRate: 0
      }
    } catch (error) {
      console.error('❌ getGradeViewData error:', error)
      throw error
    }
  },

  /**
   * Lấy danh sách học sinh với điểm số chi tiết
   */
  getStudentGrades: async (filters?: GradeViewFilters): Promise<StudentGradeDetail[]> => {
    const response = await ApiService.get<StudentGradeDetail[]>("/teacher/grades/students", filters)
    return response.data || []
  },

  /**
   * Lấy thống kê theo môn học
   */
  getSubjectStats: async (): Promise<SubjectStats[]> => {
    const response = await ApiService.get<SubjectStats[]>("/teacher/grades/subject-stats")
    return response.data || []
  },

  /**
   * Cập nhật điểm số của học sinh
   */
  updateStudentGrade: async (studentId: string, assessmentId: string, score: number): Promise<void> => {
    await ApiService.put("/teacher/grades/students/update", {
      studentId,
      assessmentId,
      score
    })
  },

  // ===== Filter Options =====

  /**
   * Lấy danh sách lớp học active của giáo viên (cho dropdown filter)
   * Sử dụng endpoint getClassByTeacherId
   */
  getTeacherActiveClasses: async (): Promise<any[]> => {
    const response = await ApiService.get("/teacher/class-management/classes", {
      status: 'active',
      page: '1',
      limit: '100'
    })
    return response.data || []
  }
}

