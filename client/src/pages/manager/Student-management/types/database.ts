// Database types based on the Prisma schema
export interface User {
    id: string
    email: string
    password: string
    createdAt: Date
    fullName?: string
    isActive: boolean
    phone?: string
    role: string
    updatedAt: Date
    username: string
  }
  
  export interface Student {
    id: string
    userId: string
    schoolId?: string
    studentCode?: string
    dateOfBirth?: Date
    gender?: string
    address?: string
    grade?: string // Khối lớp (lớp 10, 11, 12, etc.)
    className?: string // Tên lớp (10A1, 11B2, etc.)
    createdAt: Date
    updatedAt: Date
    user: User
  }
  
  export interface StudentWithDetails extends Student {
    user: User
    totalCourses: number
    totalClasses: number
    averageGrade: number
    status: "Chờ xếp lớp" | "Đang học" | "Bảo lưu" | "Dừng học" | "Tốt nghiệp" | "Sắp học"
    statusCount: number
  }
  
  export type StudentStatus = "all" | "pending" | "studying" | "reserved" | "stopped" | "graduated" | "upcoming"
  
  export interface StudentFilters {
    search: string
    birthDay?: string
    birthMonth?: string
    birthYear?: string
    status: StudentStatus
    sortBy: "name" | "date" | "balance"
    sortOrder: "asc" | "desc"
  }
  