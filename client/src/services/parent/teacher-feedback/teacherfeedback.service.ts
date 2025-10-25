import { ApiService } from '../../common/api/api-client'
import type { ApiResponse } from '../../common/types/shared.types'
import type { AvailableTeacher, CreateTeacherFeedbackDto, TeacherFeedbackItem } from './teacherfeedback.types'

export const parentTeacherFeedbackService = {
  async getAvailableTeachers(childId: string) {
    return await ApiService.get<AvailableTeacher[]>(`/parent/teacher-feedback/teachers`, { childId })
  },

  async getFeedbacks(childId: string) {
    return await ApiService.get<TeacherFeedbackItem[]>(`/parent/teacher-feedback/${childId}`)
  },

  async createFeedback(childId: string, payload: CreateTeacherFeedbackDto) {
    return await ApiService.post<{ id: string }>(`/parent/teacher-feedback/${childId}`, payload)
  }
}

export type { AvailableTeacher, CreateTeacherFeedbackDto, TeacherFeedbackItem }
