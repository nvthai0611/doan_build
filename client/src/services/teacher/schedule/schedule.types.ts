import type { Status } from "../../common/types/shared.types"

export interface TeacherSchedule {
  date: string
  sessions: TeacherSession[]
  totalHours: number
  isAvailable: boolean
}

export interface TeacherSession {
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
    maxStudents: number
    currentStudents: number
  }
  room?: {
    id: string
    name: string
    capacity: number
  }
}

export interface ScheduleFilters {
  startDate: string
  endDate: string
  classId?: string
  status?: Status
}

export interface CreateSessionRequest {
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  notes?: string
}
