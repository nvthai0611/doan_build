import type { User, Gender } from "../../common/types/shared.types"

export interface StudentProfile extends User {
  studentId: string
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
  enrollments?: StudentEnrollment[]
  parentLinks?: StudentParentLink[]
}

export interface StudentEnrollment {
  id: string
  classId: string
  status: string
  enrolledAt: string
  class: {
    id: string
    name: string
    subject: string
  }
}

export interface StudentParentLink {
  id: string
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

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  address?: string
  grade?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
