export interface TeacherStudentLeaveRequest {
  id: string
  studentId: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  approvedBy?: string
  student?: {
    id: string
    user: {
      fullName: string
      email: string
    }
    parent?: {
      user: {
        fullName: string
        email: string
        phone?: string
      }
    }
  }
  classes?: {
    id: string
    name: string
    subject: {
      id: string
      name: string
    }
    teacher?: {
      id: string
      user: {
        fullName: string
        email: string
      }
    }
  }[]
  affectedSessions?: AffectedSessionDetail[]
  approvedByUser?: {
    fullName: string
    email: string
  }
}

export interface AffectedSessionDetail {
  id: string
  sessionId: string
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
}

export interface GetTeacherStudentLeaveRequestsParams {
  page?: number
  limit?: number
  status?: string
  classId?: string
  search?: string
}

export interface TeacherStudentLeaveRequestResponse {
  data: TeacherStudentLeaveRequest[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  counts?: {
    pending: number
    approved: number
    rejected: number
    all: number
  }
}

export interface ApproveRejectDto {
  notes?: string
}

