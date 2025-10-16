    // ===== Student Services Export =====

// Enrollment
export { studentEnrollmentService } from './enrollment/enrollment.service'
export type {
  EnrollmentRequest,
  EnrollmentQueryParams
} from './enrollment/enrollment.types'

// Schedule
export { studentScheduleService } from './schedule/schedule.service'
export type {
  StudentSchedule,
  StudentSession,
  ScheduleFilters
} from './schedule/schedule.types'

// Profile
export { studentProfileService } from './profile/profile.service'
export type {
  StudentProfile,
  StudentParentLink,
  UpdateProfileRequest,
  ChangePasswordRequest
} from './profile/profile.types'

// Grades / Transcript
export { studentGradesService } from './grades/grades.service'
export type {
  TranscriptFilters,
  TranscriptResponse,
  TranscriptEntry,
  StudentSubjectGrade,
  StudentTermResult,
} from './grades/grades.types'

// Materials
export { studentMaterialsService } from './materials/materials.service'
export type {
  StudentMaterial,
  StudentMaterialsResponse,
  GetStudentMaterialsParams,
} from './materials/materials.types'
