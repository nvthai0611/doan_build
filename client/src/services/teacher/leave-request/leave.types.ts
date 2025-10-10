export interface AffectedSessionItem {
  id: string
  date: string
  time: string
  className: string
  room: string
  selected: boolean
  replacementTeacherId?: string
}

export interface AffectedSessionsParams {
  startDate: string
  endDate: string
}

export interface ReplacementTeacher {
  id: string
  fullName: string
  email: string
  phone?: string
  subjects: string[]
  compatibilityScore: number
  compatibilityReason: string
  isAvailable: boolean
  availabilityNote?: string
}

export interface ReplacementTeachersParams {
  sessionId: string
  date: string
  time: string
}

export interface CreateLeaveRequestDto {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  image?: File
  affectedSessions: AffectedSessionItem[]
}

export interface LeaveRequest {
  id: string
  requestType: string
  teacherId: string
  startDate: string
  endDate: string
  reason: string
  status: string
  imageUrl?: string
  notes?: string
  createdAt: string
  approvedAt?: string
  createdBy: string
  approvedBy?: string
  affectedSessions: AffectedSessionDetail[]
  createdByUser?: {
    fullName: string
    email: string
  }
  approvedByUser?: {
    fullName: string
    email: string
  }
}

export interface AffectedSessionDetail {
  id: string
  sessionId: string
  replacementTeacherId?: string
  notes?: string
  createdAt: string
  session: {
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    class: {
      id: string
      name: string
      subject: {
        id: string
        name: string
      }
    }
    room?: {
      id: string
      name: string
    }
  }
  replacementTeacher?: {
    id: string
    user: {
      fullName: string
      email: string
    }
  }
}
