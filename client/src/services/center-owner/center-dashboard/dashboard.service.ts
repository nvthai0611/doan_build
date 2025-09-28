import { ApiService } from "../../common/api/api-client"
import type { 
  DashboardOverview,
  RevenueData,
  ClassStats,
  TeacherStats,
  StudentStats,
  RevenueChartData,
  AttendanceChartData,
  RecentActivity,
  NotificationItem,
  QuickAction,
  DashboardFilters,
  PerformanceMetrics,
  DashboardAlert,
  SystemHealth
} from "./dashboard.types"

export const centerOwnerDashboardService = {
  // ===== Dashboard Overview =====
  
  /**
   * Lấy tổng quan dashboard
   */
  getOverview: async (filters?: DashboardFilters): Promise<DashboardOverview> => {
    const response = await ApiService.get<DashboardOverview>("/admin-center/dashboard/overview", filters)
    return response.data
  },

  /**
   * Lấy dữ liệu doanh thu
   */
  getRevenueData: async (filters?: DashboardFilters): Promise<RevenueData[]> => {
    const response = await ApiService.get<RevenueData[]>("/admin-center/dashboard/revenue", filters)
    return response.data
  },

  /**
   * Lấy thống kê lớp học
   */
  getClassStats: async (filters?: DashboardFilters): Promise<ClassStats> => {
    const response = await ApiService.get<ClassStats>("/admin-center/dashboard/class-stats", filters)
    return response.data
  },

  /**
   * Lấy thống kê giáo viên
   */
  getTeacherStats: async (filters?: DashboardFilters): Promise<TeacherStats> => {
    const response = await ApiService.get<TeacherStats>("/admin-center/dashboard/teacher-stats", filters)
    return response.data
  },

  /**
   * Lấy thống kê học sinh
   */
  getStudentStats: async (filters?: DashboardFilters): Promise<StudentStats> => {
    const response = await ApiService.get<StudentStats>("/admin-center/dashboard/student-stats", filters)
    return response.data
  },

  // ===== Chart Data =====

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  getRevenueChartData: async (filters?: DashboardFilters): Promise<RevenueChartData> => {
    const response = await ApiService.get<RevenueChartData>("/admin-center/dashboard/revenue-chart", filters)
    return response.data
  },

  /**
   * Lấy dữ liệu biểu đồ điểm danh
   */
  getAttendanceChartData: async (filters?: DashboardFilters): Promise<AttendanceChartData> => {
    const response = await ApiService.get<AttendanceChartData>("/admin-center/dashboard/attendance-chart", filters)
    return response.data
  },

  // ===== Activities and Notifications =====

  /**
   * Lấy hoạt động gần đây
   */
  getRecentActivities: async (limit?: number): Promise<RecentActivity[]> => {
    const params = limit ? { limit } : {}
    const response = await ApiService.get<RecentActivity[]>("/admin-center/dashboard/recent-activities", params)
    return response.data
  },

  /**
   * Lấy thông báo
   */
  getNotifications: async (unreadOnly?: boolean): Promise<NotificationItem[]> => {
    const params = unreadOnly ? { unreadOnly: true } : {}
    const response = await ApiService.get<NotificationItem[]>("/admin-center/dashboard/notifications", params)
    return response.data
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    await ApiService.patch(`/admin-center/dashboard/notifications/${notificationId}/read`)
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllNotificationsAsRead: async (): Promise<void> => {
    await ApiService.patch("/admin-center/dashboard/notifications/mark-all-read")
  },

  // ===== Quick Actions =====

  /**
   * Lấy danh sách hành động nhanh
   */
  getQuickActions: async (): Promise<QuickAction[]> => {
    const response = await ApiService.get<QuickAction[]>("/admin-center/dashboard/quick-actions")
    return response.data
  },

  // ===== Performance Metrics =====

  /**
   * Lấy chỉ số hiệu suất
   */
  getPerformanceMetrics: async (filters?: DashboardFilters): Promise<PerformanceMetrics> => {
    const response = await ApiService.get<PerformanceMetrics>("/admin-center/dashboard/performance-metrics", filters)
    return response.data
  },

  // ===== Alerts and System Health =====

  /**
   * Lấy cảnh báo dashboard
   */
  getDashboardAlerts: async (): Promise<DashboardAlert[]> => {
    const response = await ApiService.get<DashboardAlert[]>("/admin-center/dashboard/alerts")
    return response.data
  },

  /**
   * Lấy tình trạng hệ thống
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await ApiService.get<SystemHealth>("/admin-center/dashboard/system-health")
    return response.data
  },

  // ===== Reports =====

  /**
   * Tạo báo cáo tổng hợp
   */
  generateReport: async (type: "monthly" | "quarterly" | "yearly", filters?: DashboardFilters): Promise<Blob> => {
    const params = { type, ...filters }
    return await ApiService.downloadExcel("/admin-center/dashboard/generate-report", params)
  },

  /**
   * Lấy báo cáo doanh thu chi tiết
   */
  getRevenueReport: async (filters?: DashboardFilters): Promise<Blob> => {
    return await ApiService.downloadExcel("/admin-center/dashboard/revenue-report", filters)
  },

  /**
   * Lấy báo cáo điểm danh
   */
  getAttendanceReport: async (filters?: DashboardFilters): Promise<Blob> => {
    return await ApiService.downloadExcel("/admin-center/dashboard/attendance-report", filters)
  },

  // ===== Settings =====

  /**
   * Lưu cài đặt dashboard
   */
  saveDashboardSettings: async (settings: any): Promise<void> => {
    await ApiService.post("/admin-center/dashboard/settings", settings)
  },

  /**
   * Lấy cài đặt dashboard
   */
  getDashboardSettings: async (): Promise<any> => {
    const response = await ApiService.get("/admin-center/dashboard/settings")
    return response.data
  }
}
