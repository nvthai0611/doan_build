import type { User, BaseFilters, DateFilters, Gender, Status } from "../../common/types/shared.types"

// ===== Teacher Management Types =====
export interface CreateTeacherRequest {
  email: string
  password: string
  fullName: string
  username: string
  phone?: string
  role: "teacher"
  contractEnd?: string
  subjects?: string[]
  salary?: number
  isActive?: boolean
  birthDate?: string
  gender?: Gender
  notes?: string
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  id: string
}

export interface TeacherQueryParams extends BaseFilters, DateFilters {
  role?: "teacher" | "admin" | "center_owner"
  birthYear?: string
  gender?: string
  subjects?: string[]
}

export interface TeacherResponse {
  data: Teacher[]
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

export interface Teacher {
  id: string
  userId: string
  contractEnd?: string
  subjects: string[]
  salary?: number
  birthDate?: string
  gender?: Gender
  createdAt: string
  updatedAt: string
  user: User
  classes?: TeacherClass[]
  contracts?: Contract[]
  leaveRequests?: LeaveRequest[]
  payrolls?: Payroll[]
  documents?: TeacherDocument[]
}

export interface TeacherClass {
  id: string
  name: string
  subject: {
    id: string
    name: string
  }
  status: Status
  startDate?: string
  endDate?: string
  maxStudents?: number
  currentStudents: number
}

export interface Contract {
  id: string
  startDate?: string
  endDate?: string
  salary?: number
  status: Status
  terms?: any
  createdAt: string
}

export interface LeaveRequest {
  id: string
  requestType: string
  startDate: string
  endDate: string
  reason: string
  status: Status
  createdAt: string
}

export interface Payroll {
  id: string
  periodStart: string
  periodEnd: string
  baseSalary: number
  bonuses: number
  deductions: number
  totalAmount: number
  status: Status
  paidAt?: string
}

export interface TeacherDocument {
  id: string
  docType?: string
  docUrl?: string
  uploadedAt: string
}

// ===== Teacher Statistics =====
export interface TeacherStats {
  total: number
  active: number
  inactive: number
  byGender: {
    male: number
    female: number
    other: number
  }
  bySubject: Record<string, number>
  averageSalary: number
  totalClasses: number
  totalStudents: number
}

// ===== File Operations =====
export interface TeacherImportResult {
  message: string
  successCount: number
  errorCount: number
  errors?: string[]
}

export interface TeacherExportOptions {
  format: "excel" | "csv"
  includeInactive?: boolean
  dateRange?: {
    from: string
    to: string
  }
}
