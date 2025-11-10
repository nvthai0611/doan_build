// ===== Child Classes Types =====

export interface ChildClass {
  id: string
  name: string
  classCode: string
  status: "ready" | "active" | "completed"
  progress: number
  currentStudents: number
  maxStudents: number
  description: string
  
  // Full objects
  teacher?: {
    id: string
    user: {
      fullName: string
      email: string
    }
  } | null
  
  room?: {
    name: string
  } | null
  
  subject?: {
    name: string
    code: string
  } | null
  
  grade?: {
    name: string
    level: number
  } | null
  
  schedule: Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
    substituteTeacher?: {
      id: string
      fullName: string | null
      until?: string | null
    } | null
  }>
  
  // Dates
  startDate?: string | null
  endDate?: string | null
  
  // Student info
  studentName: string
  enrolledAt: string
  
  // Stats
  totalSessions: number
  completedSessions: number

  // Substitution (computed)
  activePrimaryTeacher?: {
    id: string
    fullName: string | null
  } | null
  activeSubstituteTeacher?: {
    id: string
    fullName: string | null
    until?: string | null
  } | null
}

export interface ChildClassesResponse {
  success: boolean
  status?: number
  data: ChildClass[]
  meta?: any
  message: string
}

export interface PendingClassRequest {
  id: string // ID của StudentClassRequest (để cancel)
  classId: string // ID của Class
  name: string
  classCode: string
  status: "ready" | "active" | "completed"
  progress: number
  currentStudents: number
  maxStudents: number
  description: string
  
  teacher?: {
    id: string
    user: {
      fullName: string
      email: string
    }
  } | null
  
  room?: {
    name: string
  } | null
  
  subject?: {
    name: string
    code: string
  } | null
  
  grade?: {
    name: string
    level: number
  } | null
  
  schedule: Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
  }>
  
  startDate?: string | null
  endDate?: string | null
  studentName: string
  
  // Request specific fields
  requestStatus: string
  requestedAt: string
  requestMessage?: string | null
  
  totalSessions: number
  completedSessions: number
}

export interface ChildClassResponse {
  success: boolean
  status?: number
  data: {
    enrolledClasses: ChildClass[]
    pendingRequests: PendingClassRequest[]
  }
  meta?: any
  message: string
}

