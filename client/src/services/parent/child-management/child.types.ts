import type { User, Gender } from "../../common/types/shared.types"

export interface Child {
  id: string
  userId: string
  studentCode?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  grade?: string
  school: {
    id: string
    name: string
    address?: string
    phone?: string
  }
  user: User
  enrollments?: ChildEnrollment[]
  attendances?: ChildAttendance[]
  grades?: ChildGrade[]
  payments?: ChildPayment[]
}

export interface ChildEnrollment {
  id: string
  classId: string
  status: string
  enrolledAt: string
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
    startDate?: string
    endDate?: string
  }
}

export interface ChildAttendance {
  id: string
  sessionId: string
  status: "present" | "absent" | "late"
  note?: string
  session: {
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    class: {
      name: string
      subject: {
        name: string
      }
    }
  }
}

export interface ChildGrade {
  id: string
  subject: string
  examName: string
  date: string
  score: number | null
  maxScore: number
  status: 'excellent' | 'good' | 'average'
  teacher: string
  feedback: string
  gradedAt: string
  assessmentType: string
  className: string
}

export interface ChildPayment {
  id: string
  amount: number
  method: string
  status: string
  paidAt: string
  feeRecord: {
    feeStructure: {
      name: string
    }
  }
}

export interface ChildQueryParams {
  search?: string
  grade?: string
  schoolId?: string
  enrollmentStatus?: "enrolled" | "not_enrolled" | "all"
  page?: number
  limit?: number
}
