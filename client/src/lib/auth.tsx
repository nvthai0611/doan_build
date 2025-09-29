"use client"

// Authentication context and utilities
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "../services/common/auth/auth.service"
import { toast } from "sonner"

export type UserRole = "center_owner" | "teacher" | "admin" | "student" | "parent"

export interface User {
  id: string
  email: string
  fullName: string
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
  login: (email: string, password: string) => Promise<void>
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
      const savedUser = localStorage.getItem("user")
      const savedAccessToken = localStorage.getItem("accessToken")
      const savedRefreshToken = localStorage.getItem("refreshToken")

      if (savedUser && savedAccessToken) {
        try {
          const userData = JSON.parse(savedUser) as User
          // await verifyToken();
          setUser(userData)
          // Skip token verification for now to test
        } catch (error) {
          console.error("Error parsing saved user data:", error)
          clearAuthData()
        }
      } else {
        console.log("AuthProvider: No saved user or access token found")
      }
      console.log("AuthProvider: Setting loading to false")
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const verifyToken = async () => {
    try {
      console.log("verifyToken: Calling getProfile...")
      const response = await authService.getProfile()
      console.log("verifyToken: Profile response:", response)
      setUser(response as User)
      localStorage.setItem("user", JSON.stringify(response))
      console.log("verifyToken: Token verification successful")
    } catch (error) {
      console.error("Token verification failed:", error)
      // Token is invalid, try to refresh
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        try {
          console.log("verifyToken: Attempting token refresh...")
          await authService.refreshToken(refreshToken)
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError)
          clearAuthData()
        }
      } else {
        console.log("verifyToken: No refresh token, clearing auth data")
        clearAuthData()
      }
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await authService.refreshToken(refreshToken)
      localStorage.setItem("accessToken", response.accessToken)
      setUser(response as any)
      localStorage.setItem("user", JSON.stringify(response as any))
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  const clearAuthData = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login({ email, password })
      // Store tokens and user data
      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.user))
      toast.success("Đăng nhập thành công");
      setUser(response.user as User)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại"
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