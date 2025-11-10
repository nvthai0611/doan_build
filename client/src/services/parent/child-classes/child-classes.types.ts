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

export interface ChildClassResponse {
  success: boolean
  status?: number
  data: ChildClass[]
  meta?: any
  message: string
}

