// ===== Common Services Export =====

// API Client
export { ApiService, apiClient } from './api/api-client'

// Auth Services
export { authService } from './auth/auth.service'
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ProfileResponse,
  UserPreferences,
  Permission,
  Role,
  AuthState
} from './auth/auth.types'

// Shared Types
export type {
  ApiResponse,
  PaginatedResponse,
  BaseQueryParams,
  DateRangeParams,
  User,
  UserRole,
  FileUploadResponse,
  FileDownloadOptions,
  Status,
  Gender,
  ApiError,
  BaseFilters,
  DateFilters
} from './types/shared.types'

// School Services
export { SchoolService, schoolService } from './school/school.service'
export type { SchoolOption } from './school/school.types'

// Cloudinary Services
export { CloudinaryUploadService } from './cloudinary/cloudinary-upload.service'

// Validation Utils
export {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidVietnameseId,
  isValidDate,
  isValidTime,
  isValidUrl,
  isValidFileSize,
  isValidFileType,
  validateRequired,
  sanitizeString,
  formatValidationError
} from './utils/validation.utils'
