export interface StudentUser {
  id: string
  email: string
  fullName: string
  phone?: string
  avatar?: string
  isActive: boolean
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthDate?: string
  createdAt: string
  updatedAt: string
}

export interface ParentUser {
  id: string
  fullName: string
  email: string
  phone?: string
  avatar?: string
}

export interface Parent {
  id: string
  user: ParentUser
  createdAt: string
  updatedAt: string
}

export interface School {
  id: string
  name: string
  address?: string
  phone?: string
}

export interface Teacher {
  id: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

export interface Subject {
  id: string
  name: string
  code: string
}

export interface Class {
  id: string
  name: string
  status: string
  subject: Subject
  teacher: Teacher | null
}

export interface Enrollment {
  id: string
  status: string
  enrolledAt: string
  completedAt?: string
  finalGrade?: number
  completionStatus?: string
  class: Class
  teacher: Teacher | null
}

export interface Student {
  id: string
  studentCode: string
  address?: string
  grade?: string
  createdAt: string
  updatedAt: string
  user: StudentUser
  parent: Parent | null
  school: School
  enrollments: Enrollment[]
}

export interface StudentListResponse {
  students: Student[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface StudentCountResponse {
  total: number
  counts: Record<string, number>
}
