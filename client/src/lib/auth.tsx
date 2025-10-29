// Authentication context and utilities
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "../services/common/auth/auth.service"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { TokenStorage } from "../utils/clientAxios"

export type UserRole = "center_owner" | "teacher" | "admin" | "student" | "parent"

export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  fullName?: string
  role: UserRole
  phone?: string
  isActive: boolean
  teacher?: any
  student?: any
  parent?: any
  createdAt?: string
  updatedAt?: string
  permissions?: string[]
  roleData?: any
}

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string) => Promise<{ user: User }>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing session
      const savedUser = Cookies.get("user")
      const savedAccessToken = Cookies.get("accessToken")
      const savedRefreshToken = Cookies.get("refreshToken")

      if (savedUser && savedAccessToken && savedRefreshToken) {
        try {
          const userData = JSON.parse(savedUser || '{}') as User
          setUser(userData)
          try {
            await verifyToken()
          } catch (error) {
          }
        } catch (error) {
          clearAuthData()
        }
      } else {
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const verifyToken = async () => {
    try {
      const response = await authService.getProfile()
      setUser(response as User)
      Cookies.set("user", JSON.stringify(response))
    } catch (error) {
      // Token is invalid, try to refresh
      const refreshToken = Cookies.get("refreshToken")
      if (!refreshToken || refreshToken === 'undefined') {
        throw new Error("No refresh token available")
      }
      try {
        await authService.refreshToken(refreshToken)
      } catch (refreshError) {
        clearAuthData()
      }
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken")
      if (!refreshToken || refreshToken === 'undefined') {
        throw new Error("No refresh token available")
      }
      const response = await authService.refreshToken(refreshToken)
      
      TokenStorage.set(response.accessToken)
      
      if (response.refreshToken) {
        Cookies.set("refreshToken", response.refreshToken)
      }
      
      if (response.user) {
        setUser(response.user as User)
        Cookies.set("user", JSON.stringify(response.user))
      }
      
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  const clearAuthData = () => {
    setUser(null)
    Cookies.remove("user")
    Cookies.remove("accessToken")
    Cookies.remove("refreshToken")
    TokenStorage.clear()
  }

  const login = async (identifier: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login({ identifier, password })
      
      Cookies.set("accessToken", response.accessToken)
      Cookies.set("refreshToken", response.refreshToken)
      Cookies.set("user", JSON.stringify(response.user))
      
      TokenStorage.set(response.accessToken)
      
      toast.success("Đăng nhập thành công")
      setUser(response.user as User)
      return { user: response.user as User }
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || "Email/Tên đăng nhập hoặc mật khẩu không đúng"
      toast.error(errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)    
    try {
      await authService.logout()
      toast.success("Đăng xuất thành công")
    } catch (error) {
      toast.error("Đăng xuất thất bại")
    } finally {
      clearAuthData()
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        refreshToken, 
        loading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}