import type { Status } from "../../common/types/shared.types"

// ===== Dashboard Overview Types =====
export interface DashboardOverview {
  totalTeachers: number
  totalStudents: number
  totalClasses: number
  totalRevenue: number
  activeClasses: number
  completedClasses: number
  pendingClasses: number
  monthlyRevenue: number
  monthlyGrowth: number
  studentGrowth: number
  teacherGrowth: number
}

export interface RevenueData {
  period: string
  amount: number
  growth: number
}

export interface ClassStats {
  total: number
  active: number
  completed: number
  draft: number
  cancelled: number
  bySubject: Record<string, number>
  byTeacher: Record<string, number>
  averageStudents: number
}

export interface TeacherStats {
  total: number
  active: number
  inactive: number
  byGender: {
    male: number
    female: number
    other: number
  }
  averageSalary: number
  totalClasses: number
}

export interface StudentStats {
  total: number
  active: number
  inactive: number
  enrolled: number
  notEnrolled: number
  byGender: {
    male: number
    female: number
    other: number
  }
  byGrade: Record<string, number>
  averageAge: number
}

// ===== Chart Data Types =====
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface RevenueChartData {
  monthly: TimeSeriesData[]
  daily: TimeSeriesData[]
  byClass: ChartDataPoint[]
  byTeacher: ChartDataPoint[]
}

export interface AttendanceChartData {
  daily: TimeSeriesData[]
  weekly: TimeSeriesData[]
  byClass: ChartDataPoint[]
  byTeacher: ChartDataPoint[]
}

// ===== Recent Activities =====
export interface RecentActivity {
  id: string
  type: "enrollment" | "payment" | "attendance" | "class_created" | "teacher_hired" | "student_registered"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  metadata?: any
}

export interface NotificationItem {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
}

// ===== Quick Actions =====
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  url: string
  color: string
  permission?: string
}

// ===== Dashboard Filters =====
export interface DashboardFilters {
  dateRange: {
    start: string
    end: string
  }
  period: "daily" | "weekly" | "monthly" | "yearly"
  teacherId?: string
  classId?: string
  subjectId?: string
}

// ===== Performance Metrics =====
export interface PerformanceMetrics {
  classUtilization: number
  teacherUtilization: number
  studentRetention: number
  paymentCollection: number
  averageClassSize: number
  averageAttendance: number
  revenuePerStudent: number
  revenuePerTeacher: number
}

// ===== Alerts and Warnings =====
export interface DashboardAlert {
  id: string
  type: "warning" | "error" | "info"
  title: string
  message: string
  severity: "low" | "medium" | "high"
  timestamp: string
  actionRequired: boolean
  actionUrl?: string
}

export interface SystemHealth {
  status: "healthy" | "warning" | "error"
  uptime: number
  lastBackup: string
  storageUsage: number
  activeConnections: number
  alerts: DashboardAlert[]
}
