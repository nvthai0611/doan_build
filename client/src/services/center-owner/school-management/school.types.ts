// Types cho School Management
export interface SchoolItem {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  createdAt: string
  updatedAt: string
  studentCount?: number
  teacherCount?: number
  isInUse?: boolean
}

export interface SchoolStats {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
}

export interface CreateSchoolDto {
  name: string
  address?: string
  phone?: string
}

export interface UpdateSchoolDto {
  name?: string
  address?: string
  phone?: string
}

export interface SchoolsResponse {
  success: boolean
  message: string
  data: SchoolItem[]
}

export interface SchoolResponse {
  success: boolean
  message: string
  data: SchoolItem
}
