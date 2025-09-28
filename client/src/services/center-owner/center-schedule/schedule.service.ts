import { ApiService } from "../../common/api/api-client"
import type { 
  ScheduleView,
  ClassSession,
  TeacherSchedule,
  RoomSchedule,
  Attendance,
  ScheduleFilters,
  CreateSessionRequest,
  UpdateSessionRequest,
  ScheduleChangeRequest,
  ScheduleStats,
  AttendanceStats,
  ScheduleConflict,
  RecurringSchedule,
  CreateRecurringScheduleRequest,
  ScheduleTemplate,
  ScheduleReport
} from "./schedule.types"

export const centerOwnerScheduleService = {
  // ===== Schedule Views =====
  
  /**
   * Lấy lịch theo ngày
   */
  getDailySchedule: async (date: string, filters?: ScheduleFilters): Promise<ScheduleView> => {
    const params = { date, ...filters }
    const response = await ApiService.get<ScheduleView>("/admin-center/schedule/daily", params)
    return response.data
  },

  /**
   * Lấy lịch theo tuần
   */
  getWeeklySchedule: async (startDate: string, filters?: ScheduleFilters): Promise<ScheduleView> => {
    const params = { startDate, ...filters }
    const response = await ApiService.get<ScheduleView>("/admin-center/schedule/weekly", params)
    return response.data
  },

  /**
   * Lấy lịch theo tháng
   */
  getMonthlySchedule: async (year: number, month: number, filters?: ScheduleFilters): Promise<ScheduleView> => {
    const params = { year, month, ...filters }
    const response = await ApiService.get<ScheduleView>("/admin-center/schedule/monthly", params)
    return response.data
  },

  /**
   * Lấy lịch của giáo viên
   */
  getTeacherSchedule: async (teacherId: string, startDate: string, endDate: string): Promise<TeacherSchedule> => {
    const params = { startDate, endDate }
    const response = await ApiService.get<TeacherSchedule>(`/admin-center/schedule/teacher/${teacherId}`, params)
    return response.data
  },

  /**
   * Lấy lịch của phòng học
   */
  getRoomSchedule: async (roomId: string, startDate: string, endDate: string): Promise<RoomSchedule> => {
    const params = { startDate, endDate }
    const response = await ApiService.get<RoomSchedule>(`/admin-center/schedule/room/${roomId}`, params)
    return response.data
  },

  // ===== Session Management =====

  /**
   * Tạo buổi học mới
   */
  createSession: async (data: CreateSessionRequest): Promise<ClassSession> => {
    const response = await ApiService.post<ClassSession>("/admin-center/schedule/sessions", data)
    console.log("📡 Create Session API Response:", response)
    return response.data
  },

  /**
   * Cập nhật buổi học
   */
  updateSession: async (sessionId: string, data: Partial<CreateSessionRequest>): Promise<ClassSession> => {
    const response = await ApiService.patch<ClassSession>(`/admin-center/schedule/sessions/${sessionId}`, data)
    return response.data
  },

  /**
   * Xóa buổi học
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await ApiService.delete(`/admin-center/schedule/sessions/${sessionId}`)
  },

  /**
   * Lấy chi tiết buổi học
   */
  getSessionById: async (sessionId: string): Promise<ClassSession> => {
    const response = await ApiService.get<ClassSession>(`/admin-center/schedule/sessions/${sessionId}`)
    return response.data
  },

  // ===== Attendance Management =====

  /**
   * Lấy danh sách điểm danh của buổi học
   */
  getSessionAttendance: async (sessionId: string): Promise<Attendance[]> => {
    const response = await ApiService.get<Attendance[]>(`/admin-center/schedule/sessions/${sessionId}/attendance`)
    return response.data
  },

  /**
   * Cập nhật điểm danh
   */
  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late", note?: string): Promise<Attendance> => {
    const response = await ApiService.patch<Attendance>(`/admin-center/schedule/sessions/${sessionId}/attendance`, {
      studentId,
      status,
      note
    })
    console.log("📡 Attendance API Response:", response)
    return response.data
  },

  /**
   * Cập nhật điểm danh hàng loạt
   */
  updateBulkAttendance: async (sessionId: string, attendances: Array<{ studentId: string; status: "present" | "absent" | "late"; note?: string }>): Promise<Attendance[]> => {
    const response = await ApiService.patch<Attendance[]>(`/admin-center/schedule/sessions/${sessionId}/attendance/bulk`, {
      attendances
    })
    return response.data
  },

  // ===== Schedule Changes =====

  /**
   * Yêu cầu thay đổi lịch
   */
  requestScheduleChange: async (data: ScheduleChangeRequest): Promise<any> => {
    const response = await ApiService.post("/admin-center/schedule/change-requests", data)
    return response.data
  },

  /**
   * Phê duyệt thay đổi lịch
   */
  approveScheduleChange: async (requestId: string): Promise<void> => {
    await ApiService.patch(`/admin-center/schedule/change-requests/${requestId}/approve`)
  },

  /**
   * Từ chối thay đổi lịch
   */
  rejectScheduleChange: async (requestId: string, reason: string): Promise<void> => {
    await ApiService.patch(`/admin-center/schedule/change-requests/${requestId}/reject`, { reason })
  },

  // ===== Recurring Schedules =====

  /**
   * Tạo lịch lặp lại
   */
  createRecurringSchedule: async (data: CreateRecurringScheduleRequest): Promise<RecurringSchedule> => {
    const response = await ApiService.post<RecurringSchedule>("/admin-center/schedule/recurring", data)
    return response.data
  },

  /**
   * Cập nhật lịch lặp lại
   */
  updateRecurringSchedule: async (id: string, data: Partial<CreateRecurringScheduleRequest>): Promise<RecurringSchedule> => {
    const response = await ApiService.patch<RecurringSchedule>(`/admin-center/schedule/recurring/${id}`, data)
    return response.data
  },

  /**
   * Xóa lịch lặp lại
   */
  deleteRecurringSchedule: async (id: string): Promise<void> => {
    await ApiService.delete(`/admin-center/schedule/recurring/${id}`)
  },

  // ===== Statistics and Reports =====

  /**
   * Lấy thống kê lịch học
   */
  getScheduleStats: async (filters?: ScheduleFilters): Promise<ScheduleStats> => {
    const response = await ApiService.get<ScheduleStats>("/admin-center/schedule/stats", filters)
    return response.data
  },

  /**
   * Lấy thống kê điểm danh
   */
  getAttendanceStats: async (filters?: ScheduleFilters): Promise<AttendanceStats> => {
    const response = await ApiService.get<AttendanceStats>("/admin-center/schedule/attendance-stats", filters)
    return response.data
  },

  /**
   * Lấy xung đột lịch học
   */
  getScheduleConflicts: async (filters?: ScheduleFilters): Promise<ScheduleConflict[]> => {
    const response = await ApiService.get<ScheduleConflict[]>("/admin-center/schedule/conflicts", filters)
    return response.data
  },

  /**
   * Tạo báo cáo lịch học
   */
  generateScheduleReport: async (filters?: ScheduleFilters): Promise<Blob> => {
    return await ApiService.downloadExcel("/admin-center/schedule/report", filters)
  },

  // ===== Templates =====

  /**
   * Lấy danh sách template lịch học
   */
  getScheduleTemplates: async (): Promise<ScheduleTemplate[]> => {
    const response = await ApiService.get<ScheduleTemplate[]>("/admin-center/schedule/templates")
    return response.data
  },

  /**
   * Tạo template lịch học
   */
  createScheduleTemplate: async (name: string, description: string, template: any): Promise<ScheduleTemplate> => {
    const response = await ApiService.post<ScheduleTemplate>("/admin-center/schedule/templates", {
      name,
      description,
      template
    })
    return response.data
  },

  /**
   * Áp dụng template lịch học
   */
  applyScheduleTemplate: async (templateId: string, startDate: string): Promise<void> => {
    await ApiService.post(`/admin-center/schedule/templates/${templateId}/apply`, { startDate })
  }
}
