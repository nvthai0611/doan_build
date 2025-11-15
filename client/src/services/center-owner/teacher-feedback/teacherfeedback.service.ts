import { apiClient } from '../../../utils/clientAxios'
import {
  ApiResponse,
  TeacherFeedbackItem,
  TeacherFeedbackQuery,
  ClassAIAnalysis,
} from './teacherfeedback.types'

export const teacherFeedbackService = {
  async list(params: TeacherFeedbackQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherFeedbackItem[]>>('/admin-center/teacher-feedback', { params })
    return res.data
  },

  async getClassAnalysis(classId: string) {
    const res = await apiClient.get<ApiResponse<ClassAIAnalysis>>(
      `/admin-center/teacher-feedback/class/${classId}/analysis`
    )
    return res
  },

  async getClassFeedbacks(classId: string, params: TeacherFeedbackQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherFeedbackItem[]>>('/admin-center/teacher-feedback', {
      params: { ...params, classId },
    })
    return res.data
  },
}


