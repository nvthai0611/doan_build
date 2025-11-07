import { SessionStatus, StudentStatus } from "./enums"

export interface ScheduleTabProps {
  teacherId: string
  currentDate: Date
  selectedMonth: string
  selectedYear: string
  setCurrentDate: (date: Date) => void
  setSelectedMonth: (month: string) => void
  setSelectedYear: (year: string) => void
}

export interface Student {
  id: string
  name: string
  avatar?: string
  status: StudentStatus
}

export interface TeachingSession {
  id: number | string // Session ID (có thể là string UUID từ API)
  classId?: string // ID của lớp học (để navigate đến trang lớp)
  date: Date
  title: string
  time: string
  subject: string
  class: string
  room: string
  hasAlert: boolean
  status: SessionStatus
  teacher: string // Giáo viên đang dạy (có thể là giáo viên thay thế)
  originalTeacher?: string // Giáo viên chính
  substituteTeacher?: string | null // Giáo viên thay thế
  isSubstitute?: boolean // Có phải giáo viên thay thế không
  students: Student[]
  attendanceWarnings: string[]
  description?: string
  materials?: string[]
  cancellationReason?: string
}

export interface UseTeachingSessionsReturn {
  sessions: TeachingSession[]
  loading: boolean
  error: string | null
}
