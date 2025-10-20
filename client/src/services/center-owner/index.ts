// ===== Center Owner Services Export =====

// Teacher Management
export { centerOwnerTeacherService } from './teacher-management/teacher.service'
export type {
  CreateTeacherRequest, 
  UpdateTeacherRequest,
  QueryTeacherParams, 
  TeacherResponse,
} from './teacher-management/teacher.service'

// Student Management
export { centerOwnerStudentService } from './student-management/student.service'
export type {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentQueryParams,
  StudentResponse,
  StudentImportResult,
  StudentExportOptions
} from './student-management/student.types'

// Center Dashboard
export { centerOwnerDashboardService } from './center-dashboard/dashboard.service'
export type {
  DashboardOverview,
  RevenueData,
  RevenueChartData,
  AttendanceChartData,
  RecentActivity,
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
  ScheduleConflict,
  RecurringSchedule,
  CreateRecurringScheduleRequest,
  ScheduleTemplate,
  ScheduleReport
} from './center-schedule/schedule.types'

// Settings
export { settingsService } from './settings-management/settings.service'

