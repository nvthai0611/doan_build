import type { Status } from "../../common/types/shared.types"

export interface StudentEnrollment {
  id: string
  studentId: string
  classId: string
  enrolledAt: string
  status: Status
  class: {
    id: string
    name: string
    description?: string
    subject: {
      id: string
      name: string
      code: string
    }
    teacher: {
      id: string
      user: {
        fullName: string
      }
    }
    room?: {
      id: string
      name: string
    }
    startDate?: string
    endDate?: string
    maxStudents: number
    currentStudents: number
    feeStructure?: {
      id: string
      name: string
      amount: number
      period: string
    }
  }
}

export interface EnrollmentRequest {
  classId: string
  message?: string
}

export interface EnrollmentQueryParams {
  status?: Status | "all"
  subjectId?: string
  teacherId?: string
  startDateFrom?: string
  startDateTo?: string
  page?: number
  limit?: number
}
