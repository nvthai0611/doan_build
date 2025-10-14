// ===== Teacher Services Export =====

// Class Management
export { teacherClassService } from './class-management/class.service'
export type {
  TeacherClass,
  ClassQueryParams,
  ClassResponse,
  ClassStats,
  ClassStudent,
  ClassSession,
  ClassAttendance,
  ClassMaterial,
  ClassAssessment,
  AssessmentGrade,
  ClassRequest,
  CreateClassRequest,
  UpdateClassRequest,
  EnrollStudentRequest,
  CreateSessionRequest,
  CreateAssessmentRequest,
  GradeAssessmentRequest
} from './class-management/class.types'

// Schedule
export { teacherScheduleService } from './schedule/schedule.service'
export type {
  TeacherSchedule,
  TeacherSession,
  ScheduleFilters,
  CreateSessionRequest
} from './schedule/schedule.types'

// Profile
export { teacherProfileService } from './profile/profile.service'
export type {
  TeacherProfile,
  TeacherDocument,
  TeacherClass,
  UpdateProfileRequest,
  ChangePasswordRequest
} from './profile/profile.types'

// File Management
export { teacherFileManagementService } from './file-management/file.service'
export type {
  Material,
  UploadMaterialParams,
  GetMaterialsParams,
  MaterialsResponse
} from './file-management/file.types'

// Incident Report
export { teacherIncidentReportService } from './incident-report/incident.service'
export type {
  IncidentReportCreateRequest,
  IncidentReportItem,
  IncidentReportListResponse,
} from './incident-report/incident.types'