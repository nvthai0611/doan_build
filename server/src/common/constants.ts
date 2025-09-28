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

// ==================== VALIDATION CONSTANTS ====================
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_DATE: 'Ngày không hợp lệ',
  INVALID_STATUS: 'Trạng thái không hợp lệ',
  INVALID_ENUM: 'Giá trị không hợp lệ'
}

// ==================== API RESPONSE CODES ====================
export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
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

/**
 * Validate status cho DTO
 */
export function validateStatus<T extends Record<string, string>>(
  status: string,
  validStatuses: T,
  fieldName: string = 'status'
): string {
  if (!isValidStatus(status, validStatuses)) {
    throw new Error(`${fieldName} không hợp lệ. Giá trị hợp lệ: ${Object.values(validStatuses).join(', ')}`)
  }
  return status
}

/**
 * Lấy default status cho các entity
 */
export const DEFAULT_STATUS = {
  STUDENT: StudentStatus.PENDING,
  CLASS: ClassStatus.DRAFT,
  SESSION: SessionStatus.SCHEDULED,
  ENROLLMENT: EnrollmentStatus.ACTIVE,
  REQUEST: RequestStatus.PENDING,
  CONTRACT: ContractStatus.DRAFT
}
