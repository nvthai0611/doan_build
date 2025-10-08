import { apiClient } from "../../../utils/clientAxios"
import type { 
  StudentListResponse, 
  StudentDetailResponse, 
  ClassStatisticsResponse,
  Enrollment,
  Student,
  School,
  Subject,
  Class,
  Teacher,
  Grade
} from "./common.types"

export const teacherCommonService = {
  // ===== Student Management =====
  
  /**
   * Lấy danh sách học sinh trong lớp
   */
  getListStudentOfClass: async (assignmentId: string): Promise<StudentListResponse> => {
    const response = await apiClient.get(`/teacher/common/assignment/${assignmentId}/students`)
    // API trả về object có structure {success, data, message}
    return response.data as StudentListResponse
  },

  /**
   * Lấy chi tiết học sinh trong lớp
   */
  getDetailStudentOfClass: async (studentId: string, assignmentId?: string): Promise<StudentDetailResponse> => {
    const url = assignmentId 
      ? `/teacher/common/student/${studentId}?assignmentId=${assignmentId}`
      : `/teacher/common/student/${studentId}`
    
    const response = await apiClient.get(url)
    return response.data as StudentDetailResponse
  },

  /**
   * Lấy thống kê lớp học
   */
  getClassStatistics: async (assignmentId: string): Promise<ClassStatisticsResponse> => {
    const response = await apiClient.get(`/teacher/common/assignment/${assignmentId}/statistics`)
    return response.data as ClassStatisticsResponse
  },

  // ===== Student Data Processing =====

  /**
   * Transform enrollment data to student summary format
   */
  transformEnrollmentToStudentSummary: (enrollment: Enrollment) => {
    // Tính điểm trung bình hiện tại từ grades
    let currentGrade = null
    
    if (enrollment.student.grades && enrollment.student.grades.length > 0) {
      const validGrades = enrollment.student.grades
        .filter((grade: Grade) => grade.score !== null && grade.score !== undefined)
        .map((grade: Grade) => parseFloat(grade.score.toString()))
      
      if (validGrades.length > 0) {
        const sum = validGrades.reduce((acc: number, score: number) => acc + score, 0)
        currentGrade = parseFloat((sum / validGrades.length).toFixed(1))
      }
    }

    return {
      studentId: enrollment.student.id,
      fullName: enrollment.student.user.fullName || 'N/A',
      email: enrollment.student.user.email,
      studentCode: (enrollment.student as any).studentCode || 'N/A',
      currentGrade: currentGrade
    }
  },

  /**
   * Process students data with current grade calculation
   */
  processStudentsData: (enrollments: Enrollment[]) => {
    return enrollments.map(enrollment => 
      teacherCommonService.transformEnrollmentToStudentSummary(enrollment)
    )
  }
}
