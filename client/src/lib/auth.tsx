"use client"

// Authentication context and utilities
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "center_owner" | "teacher" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  centerId?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
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

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock authentication - replace with real API call
      const mockUsers: User[] = [
        {
          id: "1",
          email: "owner@qne.edu.vn",
          name: "Phan Ngọc Ánh",
          role: "center_owner",
          centerId: "center-1",
          avatar: "/diverse-avatars.png",
        },
        {
          id: "2",
          email: "teacher@qne.edu.vn",
          name: "Nguyễn Văn Giáo",
          role: "teacher",
          centerId: "center-1",
          avatar: "/teacher-avatar.jpg",
        },
      ]

      const foundUser = mockUsers.find((u) => u.email === email)
      if (foundUser && password === "123456") {
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}
