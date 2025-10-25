import { apiClient } from "../../utils/clientAxios"

export interface LeaveRequest {
  id: string
  requestType: string
  teacherId: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  imageUrl?: string
  createdAt: string
  approvedAt?: string
  teacher: {
    user: {
      fullName: string
      email: string
    }
  }
  approvedByUser?: {
    fullName: string
    email: string
  }
  affectedSessions?: Array<{
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    class: {
      name: string
      subject: {
        name: string
      }
    }
  }>
}

export interface SessionRequest {
  id: string
  requestType: string
  teacherId: string
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  reason: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  teacher: {
    user: {
      fullName: string
      email: string
    }
  }
  class: {
    name: string
    subject: {
      name: string
    }
  }
  room?: {
    name: string
    capacity: number
  }
  approvedByUser?: {
    fullName: string
    email: string
  }
}

export interface ScheduleChange {
  id: string
  classId: string
  originalDate: string
  originalTime: string
  newDate: string
  newTime: string
  newRoomId?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  processedAt?: string
  class: {
    name: string
    subject: {
      name: string
    }
    teacher: {
      user: {
        fullName: string
        email: string
      }
    }
  }
  newRoom?: {
    name: string
    capacity: number
  }
}

export interface RequestsResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class RequestsService {
  // Leave Requests
  async getLeaveRequests(params: {
    teacherId?: string
    status?: string
    search?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }): Promise<RequestsResponse<LeaveRequest>> {
    const response = await apiClient.get('/admin-center/leave-requests', { params })
    return response as any
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    const response = await apiClient.get(`/admin-center/leave-requests/${id}`)
    return response.data as any
  }

  async approveLeaveRequest(id: string, action: 'approve' | 'reject', notes?: string): Promise<LeaveRequest> {
    const response = await apiClient.patch(`/admin-center/leave-requests/${id}/${action}`, {
      notes
    })
    return response as any
  }

  // Session Requests
  async getSessionRequests(params: {
    teacherId?: string
    classId?: string
    status?: string
    requestType?: string
    search?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }): Promise<RequestsResponse<SessionRequest>> {
    const response = await apiClient.get('/admin-center/session-requests', { params })
    return response as any
  }

  async getSessionRequestById(id: string): Promise<SessionRequest> {
    const response = await apiClient.get(`/admin-center/session-requests/${id}`)
    return response.data as any
  }

  async approveSessionRequest(id: string, action: 'approve' | 'reject', notes?: string): Promise<SessionRequest> {
    
    const response = await apiClient.patch(`/admin-center/session-requests/${id}/${action}`, {
      notes
    })
    return response as any
  }

  // Schedule Changes
  async getScheduleChanges(params: {
    classId?: string
    status?: string
    search?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }): Promise<RequestsResponse<ScheduleChange>> {
    const response = await apiClient.get('/admin-center/schedule-changes', { params })
    return response as any
  }

  async getScheduleChangeById(id: string): Promise<ScheduleChange> {
    const response = await apiClient.get(`/admin-center/schedule-changes/${id}`)
    return response.data as any
  }

  async approveScheduleChange(id: string, action: 'approve' | 'reject', notes?: string): Promise<ScheduleChange> {
    const response = await apiClient.patch(`/admin-center/schedule-changes/${id}/${action}`, {
      notes
    })
    return response as any
  }
}

export const requestsService = new RequestsService()
