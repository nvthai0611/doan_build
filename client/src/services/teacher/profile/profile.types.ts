import type { User, Gender } from "../../common/types/shared.types"

export interface TeacherProfile extends User {
  teacherId: string
  contractEnd?: string
  subjects: string[]
  salary?: number
  birthDate?: string
  gender?: Gender
  documents?: TeacherDocument[]
  classes?: TeacherClass[]
}

export interface TeacherDocument {
  id: string
  docType: string
  docUrl: string
  uploadedAt: string
}

export interface TeacherClass {
  id: string
  name: string
  subject: string
  status: string
  studentCount: number
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  birthDate?: string
  gender?: Gender
  subjects?: string[]
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
