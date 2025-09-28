// ===== Common API Response Types =====
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  success?: boolean
  status?: number
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page?: number
    limit: number
    total?: number
    totalPages: number
  }
}

// ===== Common Query Parameters =====
export interface BaseQueryParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: string | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface DateRangeParams {
  startDate?: string | "createdAt"
  endDate?: string | "updatedAt"
}

// ===== User Types =====
export interface User {
  id: string
  email: string
  fullName: string
  username: string
  phone?: string
  role: UserRole
  isActive: boolean
  createdAt: string | "createdAt" | "updatedAt"
  updatedAt: string | "createdAt" | "updatedAt"
}

export type UserRole = "admin" | "center_owner" | "teacher" | "student" | "parent"

// ===== File Upload Types =====
export interface FileUploadResponse {
  message?: string
  successCount: number
  errorCount: number
  errors?: string[]
}

export interface FileDownloadOptions {
  contentType?: string | "application/json"
  filename?: string
}

// ===== Common Status Types =====
export type Status = "active" | "inactive" | "pending" | "completed" | "cancelled" | "draft"

export type Gender = "male" | "female" | "other"

// ===== Error Types =====
export interface ApiError {
  message?: string
  code?: string
  details?: any
}

// ===== Common Filter Types =====
export interface BaseFilters extends BaseQueryParams {
  status?: Status | "all"
  isActive?: boolean
}

export interface DateFilters extends DateRangeParams {
  createdFrom?: string | "createdAt"
  createdTo?: string | "createdAt"
  updatedFrom?: string
  updatedTo?: string | "updatedAt"
}
