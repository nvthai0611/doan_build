// ===== Main Services Export =====

// Common Services
export * from './common'

// Role-based Services
export * from './center-owner'
export * from './teacher'
export * from './student'
export * from './parent'

// Legacy Services (for backward compatibility)
export { centerOwnerTeacherService } from './center-owner/teacher-management/teacher.service'
export { teacherScheduleService } from './teacher/schedule/schedule.service'
export { scheduleService } from './scheduleService'
