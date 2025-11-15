import { apiClient } from '../../../utils/clientAxios'
import {
  ApiResponse,
  TeacherFeedbackItem,
  TeacherFeedbackQuery,
  SingleFeedbackAIAnalysis,
  TeacherAIAnalysis,
  TeacherAIAnalysisQuery,
  ClassAIAnalysis,
} from './teacherfeedback.types'

export const teacherFeedbackService = {
  async list(params: TeacherFeedbackQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherFeedbackItem[]>>('/admin-center/teacher-feedback', { params })
    return res.data
  },

  async analyzeSingleFeedback(feedbackId: string) {
    const res = await apiClient.get<ApiResponse<SingleFeedbackAIAnalysis>>(
      `/admin-center/teacher-feedback/${feedbackId}/ai-analysis`
    )
    return res.data
  },

  async analyzeTeacherFeedbacks(teacherId: string, params: TeacherAIAnalysisQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherAIAnalysis>>(
      `/admin-center/teacher-feedback/teacher/${teacherId}/ai-analysis`,
      { params }
    )
    return res.data
  },

  async getClassAnalysis(classId: string) {
    const res = await apiClient.get<ApiResponse<ClassAIAnalysis>>(
      `/admin-center/teacher-feedback/class/${classId}/analysis`
    )
    return res.data
  },

  async getClassFeedbacks(classId: string, params: TeacherFeedbackQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherFeedbackItem[]>>('/admin-center/teacher-feedback', {
      params: { ...params, classId },
    })
    return res.data
  },
}


