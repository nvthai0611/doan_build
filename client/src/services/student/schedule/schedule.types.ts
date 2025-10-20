import type { Status } from "../../common/types/shared.types"

export interface StudentSchedule {
  date: string
  sessions: StudentSession[]
  totalHours: number
}

export interface StudentSession {
  id: string
  classId: string
  teacherId?: string
  academicYear: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  status: Status
  notes?: string
  createdAt: string
  class: {
    id: string
    name: string
    subject: {
      id: string
      name: string
      code: string
    }
    teacher: {
      id: string
      user: {
        id: string
        fullName: string
        email: string
        phone?: string
      }
    }
  }
  room?: {
    id: string
    name: string
    capacity?: number
  }
  teacher?: {
    id: string
    user: {
      id: string
      fullName: string
      email: string
      phone?: string
    }
  }
  // Attendance data từ backend mới
  attendanceStatus?: "present" | "absent" | "late" | "excused" | null
  attendanceNote?: string | null
  attendanceRecordedAt?: string | null
  attendanceRecordedBy?: {
    id: string
    fullName: string
  } | null
  // Legacy attendance field (để backward compatibility)
  attendance?: {
    status: "present" | "absent" | "late" | "excused"
    note?: string
  }
  attendances?: Array<{
    id: string
    status: "present" | "absent" | "late" | "excused"
    note?: string
    recordedAt: string
    recordedByUser: {
      id: string
      fullName: string
    }
  }>
}

export interface ScheduleFilters {
  startDate?: string
  endDate?: string
  classId?: string
  status?: Status
}

