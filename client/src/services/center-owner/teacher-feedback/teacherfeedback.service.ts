import { apiClient } from '../../../utils/clientAxios'
import { ApiResponse, TeacherFeedbackItem, TeacherFeedbackQuery } from './teacherfeedback.types'

export const teacherFeedbackService = {
  async list(params: TeacherFeedbackQuery = {}) {
    const res = await apiClient.get<ApiResponse<TeacherFeedbackItem[]>>('/admin-center/teacher-feedback', { params })
    return res.data
  },
}


