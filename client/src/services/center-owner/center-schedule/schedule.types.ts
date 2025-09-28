import type { Status } from "../../common/types/shared.types"

// ===== Schedule Management Types =====
export interface ScheduleView {
  id: string
  name: string
  type: "daily" | "weekly" | "monthly" | "yearly"
  date: string
  classes: ClassSession[]
  teachers: TeacherSchedule[]
  rooms: RoomSchedule[]
}

export interface ClassSession {
  id: string
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  status: Status
  notes?: string
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
    maxStudents: number
    currentStudents: number
  }
  room?: {
    id: string
    name: string
    capacity: number
  }
  attendances?: Attendance[]
}

export interface TeacherSchedule {
  teacherId: string
  teacher: {
    id: string
    user: {
      fullName: string
    }
  }
  sessions: ClassSession[]
  totalHours: number
  isAvailable: boolean
}

export interface RoomSchedule {
  roomId: string
  room: {
    id: string
    name: string
    capacity: number
  }
  sessions: ClassSession[]
  utilization: number
}

export interface Attendance {
  id: string
  studentId: string
  status: "present" | "absent" | "late"
  note?: string
  recordedAt: string
  student: {
    id: string
    user: {
      fullName: string
    }
  }
}

// ===== Schedule Filters =====
export interface ScheduleFilters {
  date?: string
  startDate?: string
  endDate?: string
  teacherId?: string
  classId?: string
  roomId?: string
  status?: Status
  viewType?: "daily" | "weekly" | "monthly"
}

// ===== Schedule Operations =====
export interface CreateSessionRequest {
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  notes?: string
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string
}

export interface ScheduleChangeRequest {
  sessionId: string
  newDate?: string
  newStartTime?: string
  newEndTime?: string
  newRoomId?: string
  reason: string
}

// ===== Schedule Statistics =====
export interface ScheduleStats {
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  upcomingSessions: number
  averageAttendance: number
  roomUtilization: number
  teacherUtilization: number
  conflicts: number
}

export interface AttendanceStats {
  totalStudents: number
  present: number
  absent: number
  late: number
  attendanceRate: number
  byClass: Record<string, number>
  byTeacher: Record<string, number>
}

// ===== Schedule Conflicts =====
export interface ScheduleConflict {
  id: string
  type: "teacher" | "room" | "student"
  sessions: ClassSession[]
  description: string
  severity: "low" | "medium" | "high"
  suggestedResolutions: string[]
}

// ===== Recurring Schedule =====
export interface RecurringSchedule {
  id: string
  classId: string
  pattern: "daily" | "weekly" | "monthly"
  daysOfWeek?: number[]
  dayOfMonth?: number
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  roomId?: string
  isActive: boolean
}

export interface CreateRecurringScheduleRequest {
  classId: string
  pattern: "daily" | "weekly" | "monthly"
  daysOfWeek?: number[]
  dayOfMonth?: number
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  roomId?: string
}

// ===== Schedule Templates =====
export interface ScheduleTemplate {
  id: string
  name: string
  description?: string
  template: any
  isDefault: boolean
  createdAt: string
}

// ===== Schedule Reports =====
export interface ScheduleReport {
  period: string
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  averageAttendance: number
  roomUtilization: number
  teacherUtilization: number
  revenue: number
  byClass: Record<string, any>
  byTeacher: Record<string, any>
  byRoom: Record<string, any>
}
