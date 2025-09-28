import { ApiService } from "../../common/api/api-client"
import type { TeacherSchedule, TeacherSession, ScheduleFilters, CreateSessionRequest } from "./schedule.types"

export const teacherScheduleService = {
  getSchedule: async (filters: ScheduleFilters): Promise<TeacherSchedule[]> => {
    const response = await ApiService.get<TeacherSchedule[]>("/teacher/schedule", filters)
    return response.data
  },

  getSessionById: async (sessionId: string): Promise<TeacherSession> => {
    const response = await ApiService.get<TeacherSession>(`/teacher/schedule/sessions/${sessionId}`)
    return response.data
  },

  createSession: async (data: CreateSessionRequest): Promise<TeacherSession> => {
    const response = await ApiService.post<TeacherSession>("/teacher/schedule/sessions", data)
    return response.data
  },

  updateSession: async (sessionId: string, data: Partial<CreateSessionRequest>): Promise<TeacherSession> => {
    const response = await ApiService.patch<TeacherSession>(`/teacher/schedule/sessions/${sessionId}`, data)
    return response.data
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await ApiService.delete(`/teacher/schedule/sessions/${sessionId}`)
  }
}
