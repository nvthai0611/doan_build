// ===== Center Owner Services Export =====

// Teacher Management
export { centerOwnerTeacherService } from './teacher-management/teacher.service'
export type {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherQueryParams,
  TeacherResponse,
  Teacher,
  TeacherStats,
  TeacherImportResult,
  TeacherExportOptions
} from './teacher-management/teacher.types'

// Student Management
export { centerOwnerStudentService } from './student-management/student.service'
export type {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentQueryParams,
  StudentResponse,
  Student,
  StudentStats,
  StudentImportResult,
  StudentExportOptions
} from './student-management/student.types'

// Center Dashboard
export { centerOwnerDashboardService } from './center-dashboard/dashboard.service'
export type {
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
} from './center-dashboard/dashboard.types'

// Center Schedule
export { centerOwnerScheduleService } from './center-schedule/schedule.service'
export type {
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
} from './center-schedule/schedule.types'
