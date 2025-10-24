// ===== Student Types =====

export interface Student {
  id: string
  studentCode: string
  grade: string
  schoolId?: string
  parentId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
    email: string
    avatar?: string
    phoneNumber?: string
  }
  school?: {
    id: string
    name: string
  }
  enrollments?: Array<{
    id: string
    status: string
  }>
}

export interface StudentsResponse {
  success: boolean
  status: number
  data: Student[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
}
