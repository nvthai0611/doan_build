import type { User, UserRole } from "../types/shared.types"

// ===== Authentication Types =====
export interface LoginRequest {
  identifier: string // Email hoặc username
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ChildData {
  fullName: string
  dateOfBirth: string
  gender: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  username: string
  phone: string
  birthDate: string
  gender: string
  role?: UserRole
  children: ChildData[]
}

export interface RegisterResponse {
  user: User
  accessToken: string
  refreshToken: string
  message: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  user?: User
  expiresIn?: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

// ===== Profile Types =====
export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  avatar?: string
}

export interface ProfileResponse extends User {
  lastLoginAt?: string
  loginCount?: number
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

// ===== Permission Types =====
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
}

// ===== Auth State Types =====
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: Permission[]
}
