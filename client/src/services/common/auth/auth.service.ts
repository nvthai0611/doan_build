import { ApiService } from "../api/api-client"
import type { 
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
  ProfileResponse
} from "./auth.types"

export const authService = {
  // ===== Authentication =====
  
  /**
   * Đăng nhập
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await ApiService.post<LoginResponse>("/auth/login", credentials)
    return response.data
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await ApiService.post<RegisterResponse>("/auth/register", userData)
    return response.data
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    await ApiService.post("/auth/logout")
  },

  /**
   * Làm mới access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await ApiService.post<RefreshTokenResponse>("/auth/refresh", { refreshToken })
    return response.data
  },

  // ===== Password Management =====
  
  /**
   * Đổi mật khẩu
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await ApiService.post("/auth/change-password", data)
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await ApiService.post("/auth/forgot-password", data)
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await ApiService.post("/auth/reset-password", data)
  },

  // ===== Profile Management =====
  
  /**
   * Lấy thông tin profile hiện tại
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await ApiService.get<ProfileResponse>("/auth/profile")
    return response.data
  },

  /**
   * Cập nhật profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await ApiService.patch<ProfileResponse>("/auth/profile", data)
    return response.data
  },

  /**
   * Xác thực email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await ApiService.post("/auth/verify-email", { token })
  },

  /**
   * Gửi lại email xác thực
   */
  resendVerificationEmail: async (): Promise<void> => {
    await ApiService.post("/auth/resend-verification")
  },

  // ===== Session Management =====
  
  /**
   * Lấy danh sách session đang hoạt động
   */
  getActiveSessions: async (): Promise<any[]> => {
    const response = await ApiService.get<any[]>("/auth/sessions")
    return response.data
  },

  /**
   * Hủy session cụ thể
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await ApiService.delete(`/auth/sessions/${sessionId}`)
  },

  /**
   * Hủy tất cả session khác
   */
  revokeAllOtherSessions: async (): Promise<void> => {
    await ApiService.post("/auth/revoke-all-sessions")
  }
}
