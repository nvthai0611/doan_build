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

// File Management
export { centerOwnerFileManagementService } from './file-management/file.service'
export type {
  Material,
  CenterClass,
  UploadMaterialParams,
  GetMaterialsParams,
  MaterialsResponse
} from './file-management/file.types'

// Student Class Requests
export { default as studentClassRequestService } from './student-class-request.service'
export type {
  StudentClassRequest,
  StudentClassRequestDetail,
  GetRequestsParams,
  GetRequestsResponse,
  RequestDetailResponse,
  ApproveRejectResponse
} from './student-class-request.service'

// User Management
export { centerOwnerUserService } from '../adminit/user-management/user.service'
export type {
  ManagedUser,
  ManagedUserRole,
  UserListResponse,
  QueryUserParams as UserQueryParams,
} from '../adminit/user-management/user.types'

// Audit Log
export { auditLogService } from '../adminit/audit-log/audit-log.service'
export type {
  AuditLog,
  QueryAuditLogParams,
  AuditLogListResponse,
  AuditLogDetailResponse,
} from '../adminit/audit-log/audit-log.service'

// Scholarship Management
export { scholarshipService } from './scholarship-management/scholarship.service'
export type {
  Scholarship,
  CreateScholarshipDto,
  UpdateScholarshipDto,
  ScholarshipsResponse,
  ScholarshipResponse,
} from './scholarship-management/scholarship.types'

