import type { User, BaseFilters, DateFilters, Gender, Status } from "../../common/types/shared.types"

// ===== Student Management Types =====
export interface CreateStudentRequest {
  email: string
  password: string
  fullName: string
  username: string
  phone?: string
  role: "student"
  studentCode?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  grade?: string
  schoolId: string
  isActive?: boolean
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: string
}

export interface StudentQueryParams extends BaseFilters, DateFilters {
  gender?: Gender
  grade?: string
  schoolId?: string
  enrollmentStatus?: "enrolled" | "not_enrolled" | "all"
  dateOfBirthFrom?: string
  dateOfBirthTo?: string
  hasParent?: boolean
}

export interface StudentResponse {
  data: Student[]
  message?: string
  meta: {
    page?: number
    limit: number
    total?: number
    totalPages: number
  }
  success?: boolean
  status?: number
}

export interface Student {
  id: string
  userId: string
  studentCode?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  grade?: string
  schoolId: string
  createdAt: string | "createdAt" | "updatedAt"
  updatedAt: string | "createdAt" | "updatedAt"
  user: User
  school: {
    id: string
    name: string
    address?: string
    phone?: string
  }
  enrollments?: Enrollment[]
  parentLinks?: StudentParentLink[]
  attendances?: Attendance[]
  grades?: Grade[]
  payments?: Payment[]
}

export interface Enrollment {
  id: string
  studentId: string
  classId: string
  enrolledAt: string | "createdAt" | "updatedAt"
  status: Status
  class: {
    id: string
    name: string
    subject: {
      id: string
      name: string
    }
    teacher: {
      id: string
      user: {
        fullName: string
      }
    }
  }
}

export interface StudentParentLink {
  id: string
  studentId: string
  parentId: string
  relation?: string
  primaryContact: boolean
  parent: {
    id: string
    user: {
      fullName: string
      email: string
      phone?: string
    }
  }
}

export interface Attendance {
  id: string
  sessionId: string
  status: "present" | "absent" | "late"
  note?: string
  recordedAt: string | "createdAt" | "updatedAt"
  session: {
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    class: {
      name: string
    }
  }
}

export interface Grade {
  id: string
  assessmentId: string
  score?: number
  feedback?: string
  gradedAt: string | "createdAt" | "updatedAt"
  assessment: {
    name: string
    type: string
    maxScore: number
    date: string
    class: {
      name: string
    }
  }
}

export interface Payment {
  id: string
  amount: number
  method: string
  status: Status
  paidAt: string | "createdAt" | "updatedAt"
  feeRecord: {
    feeStructure: {
      name: string
    }
  }
}

// ===== Student Statistics =====
export interface StudentStats {
  total: number
  active: number
  inactive: number
  enrolled: number
  notEnrolled: number
  byGender: {
    male: number
    female: number
    other: number
  }
  byGrade: Record<string, number>
  bySchool: Record<string, number>
  averageAge: number
  totalRevenue: number
}

// ===== File Operations =====
export interface StudentImportResult {
  message?: string
  successCount: number
  errorCount: number
  errors?: string[]
}

export interface StudentExportOptions {
  format: "excel" | "csv"
  includeInactive?: boolean
  includeGrades?: boolean
  includeAttendance?: boolean
  dateRange?: {
    from: string | "createdAt" | "updatedAt"
    to: string | "createdAt" | "updatedAt"
  }
}
