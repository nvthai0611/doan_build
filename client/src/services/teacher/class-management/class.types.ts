import type { BaseFilters, DateFilters, Status } from "../../common/types/shared.types"

// ===== Teacher Class Management Types =====
export interface TeacherClass {
  id: string
  name: string
  description?: string
  subject: {
    id: string
    name: string
    code: string
  }
  teacher: {
    id: string
    user: {
      fullName: string
    }
  }
  room?: {
    id: string
    name: string
    capacity: number
  }
  startDate?: string
  endDate?: string
  maxStudents: number
  currentStudents: number
  status: Status
  feeStructure?: {
    id: string
    name: string
    amount: number
    period: string
  }
  createdAt: string
  updatedAt: string
}

export interface ClassQueryParams extends BaseFilters, DateFilters {
  status?: Status | "all"
  subjectId?: string
  roomId?: string
  startDateFrom?: string
  startDateTo?: string
  hasRoom?: boolean
}

export interface ClassResponse {
  data: TeacherClass[]
  message: string
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
  status: number
}

export interface ClassStats {
  total: number
  active: number
  completed: number
  draft: number
  cancelled: number
  bySubject: Record<string, number>
  totalStudents: number
  averageStudents: number
}

// ===== Class Students =====
export interface ClassStudent {
  id: string
  studentId: string
  enrolledAt: string
  status: Status
  student: {
    id: string
    user: {
      fullName: string
      email: string
      phone?: string
    }
    studentCode?: string
    dateOfBirth?: string
    gender?: string
  }
  attendance?: {
    totalSessions: number
    presentSessions: number
    absentSessions: number
    lateSessions: number
    attendanceRate: number
  }
  grades?: {
    averageScore: number
    totalAssessments: number
    completedAssessments: number
  }
}

// ===== Class Sessions =====
export interface ClassSession {
  id: string
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  status: Status
  notes?: string
  room?: {
    id: string
    name: string
    capacity: number
  }
  attendances: ClassAttendance[]
  materials?: ClassMaterial[]
}

export interface ClassAttendance {
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

export interface ClassMaterial {
  id: string
  title: string
  description?: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  uploadedAt: string
}

// ===== Class Assessments =====
export interface ClassAssessment {
  id: string
  name: string
  type: "quiz" | "exam" | "assignment" | "project"
  maxScore: number
  date: string
  description?: string
  createdAt: string
  grades: AssessmentGrade[]
}

export interface AssessmentGrade {
  id: string
  studentId: string
  score?: number
  feedback?: string
  gradedAt: string
  student: {
    id: string
    user: {
      fullName: string
    }
  }
}

// ===== Class Requests =====
export interface ClassRequest {
  id: string
  studentId: string
  classId: string
  message?: string
  status: Status
  processedAt?: string
  createdAt: string
  student: {
    id: string
    user: {
      fullName: string
      email: string
    }
  }
  class: {
    id: string
    name: string
  }
}

// ===== Class Operations =====
export interface CreateClassRequest {
  name: string
  description?: string
  subjectId: string
  roomId?: string
  startDate?: string
  endDate?: string
  maxStudents: number
  feeStructureId?: string
  recurringSchedule?: any
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: string
}

export interface EnrollStudentRequest {
  studentId: string
  classId: string
}

export interface CreateSessionRequest {
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  notes?: string
}

export interface CreateAssessmentRequest {
  classId: string
  name: string
  type: "quiz" | "exam" | "assignment" | "project"
  maxScore: number
  date: string
  description?: string
}

export interface GradeAssessmentRequest {
  assessmentId: string
  studentId: string
  score?: number
  feedback?: string
}
