import type { Status } from "../../common/types/shared.types"

export interface StudentSchedule {
  date: string
  sessions: StudentSession[]
  totalHours: number
}

export interface StudentSession {
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
  }
  room?: {
    id: string
    name: string
  }
  attendance?: {
    status: "present" | "absent" | "late"
    note?: string
  }
}

export interface ScheduleFilters {
  startDate: string
  endDate: string
  classId?: string
  status?: Status
}
