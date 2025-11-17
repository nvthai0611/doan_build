import { apiClient } from "../../utils/clientAxios"

export interface DashboardStats {
  totalStudents: number
  totalClasses: number
  todaySessions: number
  completedSessions: number
}

export interface TodaySession {
  id: string
  className: string
  subjectName: string
  sessionDate: string
  startTime: string
  endTime: string
  roomName: string
  status: string
}

export const teacherDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/teacher/dashboard/stats')
    return response.data
  },

  getTodaySessions: async (): Promise<TodaySession[]> => {
    const response = await apiClient.get<TodaySession[]>('/teacher/dashboard/today-sessions')
    return response.data
  }
}
