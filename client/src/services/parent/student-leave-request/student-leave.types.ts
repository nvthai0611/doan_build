export interface StudentLeaveRequest {
  id: string
  studentId: string
  classId: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  imageUrl?: string
  notes?: string
  responseNote?: string
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
  }
  class?: {
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
  }
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

export interface CreateStudentLeaveRequestDto {
  studentId: string
  classId: string
  startDate: string
  endDate: string
  reason: string
}

export interface UpdateStudentLeaveRequestDto {
  startDate?: string
  endDate?: string
  reason?: string
}

export interface GetStudentLeaveRequestsParams {
  page?: number
  limit?: number
  status?: string
  studentId?: string
  classId?: string
}

export interface StudentLeaveRequestResponse {
  data: StudentLeaveRequest[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ChildClass {
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
  schedule?: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
}

