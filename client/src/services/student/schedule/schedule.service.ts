import { ApiService } from "../../common/api/api-client"
import type { StudentSchedule, StudentSession, ScheduleFilters } from "./schedule.types"

export const studentScheduleService = {
  getSchedule: async (filters: ScheduleFilters): Promise<StudentSchedule[]> => {
    const response = await ApiService.get<StudentSchedule[]>("/student/schedule", filters)
    return response.data as StudentSchedule[]
  },

  getSessionById: async (sessionId: string): Promise<StudentSession> => {
    const response = await ApiService.get<StudentSession>(`/student/schedule/sessions/${sessionId}`)
    return response.data as StudentSession
  }
}
