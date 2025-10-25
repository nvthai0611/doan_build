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
  id: number
  date: Date
  title: string
  time: string
  subject: string
  class: string
  room: string
  hasAlert: boolean
  status: SessionStatus
  teacher: string
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
