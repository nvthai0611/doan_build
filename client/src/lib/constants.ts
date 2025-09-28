/**
 * File tập trung các constants, status và properties chung cho toàn bộ hệ thống
 * Tất cả các status và enum nên được định nghĩa ở đây để đảm bảo tính nhất quán
 */

// ==================== GENDER ENUM ====================
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác'
}

// ==================== STUDENT STATUS ====================
export enum StudentStatus {
  PENDING = 'pending',        // Chờ xếp lớp
  UPCOMING = 'upcoming',      // Sắp học
  STUDYING = 'studying',      // Đang học
  RESERVED = 'reserved',      // Bảo lưu
  STOPPED = 'stopped',        // Dừng học
  GRADUATED = 'graduated',    // Tốt nghiệp
  ALL = 'all'                 // Tất cả (dùng cho filter)
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  [StudentStatus.ALL]: 'Tất cả',
  [StudentStatus.PENDING]: 'Chờ xếp lớp',
  [StudentStatus.UPCOMING]: 'Sắp học',
  [StudentStatus.STUDYING]: 'Đang học',
  [StudentStatus.RESERVED]: 'Bảo lưu',
  [StudentStatus.STOPPED]: 'Dừng học',
  [StudentStatus.GRADUATED]: 'Tốt nghiệp'
}

export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  [StudentStatus.ALL]: 'border-blue-500 text-blue-700 bg-blue-50',
  [StudentStatus.PENDING]: 'border-orange-500 text-orange-700 bg-orange-50',
  [StudentStatus.UPCOMING]: 'border-purple-500 text-purple-700 bg-purple-50',
  [StudentStatus.STUDYING]: 'border-green-500 text-green-700 bg-green-50',
  [StudentStatus.RESERVED]: 'border-yellow-500 text-yellow-700 bg-yellow-50',
  [StudentStatus.STOPPED]: 'border-red-500 text-red-700 bg-red-50',
  [StudentStatus.GRADUATED]: 'border-emerald-500 text-emerald-700 bg-emerald-50'
}

export const STUDENT_STATUS_COUNT_COLORS: Record<StudentStatus, string> = {
  [StudentStatus.ALL]: 'bg-blue-100 text-blue-800',
  [StudentStatus.PENDING]: 'bg-orange-100 text-orange-800',
  [StudentStatus.UPCOMING]: 'bg-purple-100 text-purple-800',
  [StudentStatus.STUDYING]: 'bg-green-100 text-green-800',
  [StudentStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
  [StudentStatus.STOPPED]: 'bg-red-100 text-red-800',
  [StudentStatus.GRADUATED]: 'bg-emerald-100 text-emerald-800'
}

// Mapping từ status tiếng Việt sang enum
export const STUDENT_STATUS_MAPPING: Record<string, StudentStatus> = {
  'Chờ xếp lớp': StudentStatus.PENDING,
  'Sắp học': StudentStatus.UPCOMING,
  'Đang học': StudentStatus.STUDYING,
  'Bảo lưu': StudentStatus.RESERVED,
  'Dừng học': StudentStatus.STOPPED,
  'Tốt nghiệp': StudentStatus.GRADUATED,
  'Chưa cập nhật lịch học': StudentStatus.PENDING
}

// ==================== CLASS STATUS ====================
export enum ClassStatus {
  ACTIVE = 'active',          // Đang hoạt động
  COMPLETED = 'completed',    // Đã hoàn thành
  DRAFT = 'draft',           // Nháp
  CANCELLED = 'cancelled',   // Đã hủy
  ALL = 'all'                // Tất cả (dùng cho filter)
}

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  [ClassStatus.ALL]: 'Tất cả',
  [ClassStatus.ACTIVE]: 'Đang hoạt động',
  [ClassStatus.COMPLETED]: 'Đã hoàn thành',
  [ClassStatus.DRAFT]: 'Nháp',
  [ClassStatus.CANCELLED]: 'Đã hủy'
}

export const CLASS_STATUS_COLORS: Record<ClassStatus, string> = {
  [ClassStatus.ALL]: 'border-blue-500 text-blue-700 bg-blue-50',
  [ClassStatus.ACTIVE]: 'border-green-500 text-green-700 bg-green-50',
  [ClassStatus.COMPLETED]: 'border-emerald-500 text-emerald-700 bg-emerald-50',
  [ClassStatus.DRAFT]: 'border-gray-500 text-gray-700 bg-gray-50',
  [ClassStatus.CANCELLED]: 'border-red-500 text-red-700 bg-red-50'
}

// ==================== SESSION STATUS ====================
export enum SessionStatus {
  SCHEDULED = 'scheduled',    // Đã lên lịch
  COMPLETED = 'completed',    // Đã hoàn thành
  CANCELLED = 'cancelled',    // Đã hủy
  ALL = 'all'                // Tất cả (dùng cho filter)
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.ALL]: 'Tất cả',
  [SessionStatus.SCHEDULED]: 'Đã lên lịch',
  [SessionStatus.COMPLETED]: 'Đã hoàn thành',
  [SessionStatus.CANCELLED]: 'Đã hủy'
}

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  [SessionStatus.ALL]: 'border-blue-500 text-blue-700 bg-blue-50',
  [SessionStatus.SCHEDULED]: 'border-blue-500 text-blue-700 bg-blue-50',
  [SessionStatus.COMPLETED]: 'border-green-500 text-green-700 bg-green-50',
  [SessionStatus.CANCELLED]: 'border-red-500 text-red-700 bg-red-50'
}

// ==================== SESSION TYPE ====================
export enum SessionType {
  REGULAR = 'regular',        // Buổi học thường
  EXAM = 'exam',             // Buổi thi
  MAKEUP = 'makeup',         // Buổi học bù
  ALL = 'all'                // Tất cả (dùng cho filter)
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.ALL]: 'Tất cả',
  [SessionType.REGULAR]: 'Buổi học thường',
  [SessionType.EXAM]: 'Buổi thi',
  [SessionType.MAKEUP]: 'Buổi học bù'
}

// ==================== ATTENDANCE STATUS ====================
export enum AttendanceStatus {
  PRESENT = 'present',        // Có mặt
  ABSENT = 'absent',         // Vắng mặt
  LATE = 'late'              // Đi muộn
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Có mặt',
  [AttendanceStatus.ABSENT]: 'Vắng mặt',
  [AttendanceStatus.LATE]: 'Đi muộn'
}

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'border-green-500 text-green-700 bg-green-50',
  [AttendanceStatus.ABSENT]: 'border-red-500 text-red-700 bg-red-50',
  [AttendanceStatus.LATE]: 'border-yellow-500 text-yellow-700 bg-yellow-50'
}

// ==================== ENROLLMENT STATUS ====================
export enum EnrollmentStatus {
  ACTIVE = 'active',          // Đang học
  INACTIVE = 'inactive',     // Tạm dừng
  COMPLETED = 'completed',    // Đã hoàn thành
  CANCELLED = 'cancelled'     // Đã hủy
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ACTIVE]: 'Đang học',
  [EnrollmentStatus.INACTIVE]: 'Tạm dừng',
  [EnrollmentStatus.COMPLETED]: 'Đã hoàn thành',
  [EnrollmentStatus.CANCELLED]: 'Đã hủy'
}

// ==================== REQUEST STATUS ====================
export enum RequestStatus {
  PENDING = 'pending',        // Chờ xử lý
  APPROVED = 'approved',      // Đã duyệt
  REJECTED = 'rejected',      // Đã từ chối
  PROCESSING = 'processing'   // Đang xử lý
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'Chờ xử lý',
  [RequestStatus.APPROVED]: 'Đã duyệt',
  [RequestStatus.REJECTED]: 'Đã từ chối',
  [RequestStatus.PROCESSING]: 'Đang xử lý'
}

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'border-yellow-500 text-yellow-700 bg-yellow-50',
  [RequestStatus.APPROVED]: 'border-green-500 text-green-700 bg-green-50',
  [RequestStatus.REJECTED]: 'border-red-500 text-red-700 bg-red-50',
  [RequestStatus.PROCESSING]: 'border-blue-500 text-blue-700 bg-blue-50'
}

// ==================== CONTRACT STATUS ====================
export enum ContractStatus {
  ACTIVE = 'active',          // Đang có hiệu lực
  EXPIRED = 'expired',        // Đã hết hạn
  TERMINATED = 'terminated',  // Đã chấm dứt
  DRAFT = 'draft'            // Nháp
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: 'Đang có hiệu lực',
  [ContractStatus.EXPIRED]: 'Đã hết hạn',
  [ContractStatus.TERMINATED]: 'Đã chấm dứt',
  [ContractStatus.DRAFT]: 'Nháp'
}

// ==================== USER ROLES ====================
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.MANAGER]: 'Quản lý',
  [UserRole.TEACHER]: 'Giáo viên',
  [UserRole.STUDENT]: 'Học sinh',
  [UserRole.PARENT]: 'Phụ huynh'
}

// ==================== COMMON PROPERTIES ====================
export const COMMON_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}

export const COMMON_SORT_ORDER = {
  ASC: 'asc' as const,
  DESC: 'desc' as const
}

export const COMMON_FILTER_VALUES = {
  ALL: 'all',
  NONE: 'none'
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy label của status từ enum
 */
export function getStatusLabel<T extends Record<string, string>>(
  status: string,
  labels: T
): string {
  return labels[status as keyof T] || status
}

/**
 * Lấy màu sắc của status từ enum
 */
export function getStatusColor<T extends Record<string, string>>(
  status: string,
  colors: T
): string {
  return colors[status as keyof T] || 'border-gray-500 text-gray-700 bg-gray-50'
}

/**
 * Kiểm tra xem status có hợp lệ không
 */
export function isValidStatus<T extends Record<string, string>>(
  status: string,
  validStatuses: T
): boolean {
  return Object.values(validStatuses).includes(status)
}

/**
 * Chuyển đổi status tiếng Việt sang enum (cho student status)
 */
export function mapVietnameseStatusToEnum(vietnameseStatus: string): StudentStatus {
  return STUDENT_STATUS_MAPPING[vietnameseStatus] || StudentStatus.PENDING
}

/**
 * Chuyển đổi enum sang status tiếng Việt (cho student status)
 */
export function mapEnumToVietnameseStatus(status: StudentStatus): string {
  return STUDENT_STATUS_LABELS[status]
}

/**
 * Lấy tất cả status values từ enum (trừ ALL)
 */
export function getStatusValues<T extends Record<string, string>>(
  statusEnum: T,
  excludeAll: boolean = true
): string[] {
  const values = Object.values(statusEnum)
  return excludeAll ? values.filter(v => v !== 'all') : values
}

/**
 * Tạo options cho select dropdown từ enum
 */
export function createSelectOptions<T extends Record<string, string>>(
  statusEnum: T,
  labels: T,
  includeAll: boolean = false
): Array<{ value: string; label: string }> {
  const options = Object.values(statusEnum).map(status => ({
    value: status,
    label: labels[status as keyof T]
  }))
  
  if (includeAll) {
    return options
  }
  
  return options.filter(option => option.value !== 'all')
}
