import { ApiService } from "../../common/api/api-client"
import type { StudentSchedule, StudentSession, ScheduleFilters } from "./schedule.types"

export const studentScheduleService = {
  getSchedule: async (filters: ScheduleFilters): Promise<StudentSession[]> => {
    const response = await ApiService.get<StudentSession[]>("/student/schedule", filters)
    return response.data as StudentSession[]
  },

  getWeeklySchedule: async (weekStart: string): Promise<StudentSession[]> => {
    const response = await ApiService.get<StudentSession[]>("/student/schedule/weekly", { weekStart })
    return response.data as StudentSession[]
  },

  getMonthlySchedule: async (year: number, month: number): Promise<StudentSession[]> => {
    const response = await ApiService.get<StudentSession[]>("/student/schedule/monthly", { year, month })
    return response.data as StudentSession[]
  },

  getSessionById: async (sessionId: string): Promise<StudentSession> => {
    const response = await ApiService.get<StudentSession>(`/student/schedule/sessions/${sessionId}`)
    return response.data as StudentSession
  },

  getScheduleDetail: async (id: string): Promise<StudentSession> => {
    const response = await ApiService.get<StudentSession>(`/student/schedule/${id}`)
    return response.data as StudentSession
  }
}
