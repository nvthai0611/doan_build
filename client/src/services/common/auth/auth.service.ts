import { apiClient } from "../../../utils/clientAxios"
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
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials)
      // Backend trả về format: { success: true, message: "...", data: { accessToken, refreshToken, user } }
      return response.data as LoginResponse
    } catch (error: any) {
      throw error
    }
  },

  /**
   * Đăng ký tài khoản mới (phụ huynh)
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register/parent", userData)
    return response.data as RegisterResponse
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
  },

  /**
   * Làm mới access token
   * Gửi refresh token qua header thay vì body
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh", 
      {}, 
      {
        headers: {
          'refresh-token': refreshToken
        }
      }
    );
    return response.data as RefreshTokenResponse;
  },

  // ===== Password Management =====
  
  /**
   * Đổi mật khẩu
   */
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post("/auth/change-password", data)
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post("/auth/forgot-password", data)
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post("/auth/reset-password", data)
  },

  // ===== Profile Management =====
  
  /**
   * Lấy thông tin profile hiện tại
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>("/auth/profile");
    return response.data as ProfileResponse
  },

  /**
   * Cập nhật profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await apiClient.patch<ProfileResponse>("/auth/profile", data)
    return response.data as ProfileResponse
  },

  /**
   * Xác thực email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post("/auth/verify-email", { token })
  },

  /**
   * Gửi lại email xác thực
   */
  resendVerificationEmail: async (): Promise<void> => {
    await apiClient.post("/auth/resend-verification")
  },

  // ===== Session Management =====
  
  /**
   * Lấy danh sách session đang hoạt động
   */
  getActiveSessions: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/auth/sessions")
    return response.data as any[] 
  },

  /**
   * Hủy session cụ thể
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${sessionId}`)
  },

  /**
   * Hủy tất cả session khác
   */
  revokeAllOtherSessions: async (): Promise<void> => {
    await apiClient.post("/auth/revoke-all-sessions")
  },

  // ===== Permission Management =====
  
  /**
   * Lấy danh sách quyền của user hiện tại
   */
  getUserPermissions: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<{ data: any[] }>("/auth/permissions")
      console.log("getUserPermissions response:", response)
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((p: any) => p.name)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((p: any) => p.name)
      }
      
      return []
    } catch (error) {
      console.error("Error getting user permissions:", error)
      return []
    }
  },

  /**
   * Kiểm tra quyền cụ thể
   */
  checkPermission: async (permissionName: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<{ data: { hasPermission: boolean } }>(`/auth/permissions/check/${permissionName}`)
      console.log("checkPermission response:", response)
      
      if (response.data && response.data.data) {
        return response.data.data.hasPermission
      } else if (response.data && typeof response.data.data.hasPermission === 'boolean') {
        return response.data.data.hasPermission
      }
      
      return false
    } catch (error) {
      console.error("Error checking permission:", error)
      return false
    }
  },

  /**
   * Lấy tất cả vai trò
   */
  getAllRoles: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ data: any[] }>("/auth/roles")
      console.log("getAllRoles response:", response)
      
      if (response.data && Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      
      return []
    } catch (error) {
      console.error("Error getting all roles:", error)
      return []
    }
  },

  /**
   * Lấy tất cả quyền
   */
  getAllPermissions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ data: any[] }>("/auth/all-permissions")
      console.log("getAllPermissions response:", response)
      
      if (response.data && Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      
      return []
    } catch (error) {
      console.error("Error getting all permissions:", error)
      return []
    }
  }
}
