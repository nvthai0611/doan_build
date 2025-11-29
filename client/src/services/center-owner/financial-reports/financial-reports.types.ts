export interface FinancialSummary {
  revenue: {
    totalPaid: number
    monthCollected: number
    monthlyTrend: Array<{ label: string; revenue: number; salary: number }>
  }
  tuition: {
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
    breakdownPercent: { paid: number; pending: number; overdue: number }
    outstandingStudentsCount: number
  }
  classes: {
    topRevenue: Array<{
      classId: string
      className: string
      subjectName?: string
      revenueAmount: number
      studentCount: number
    }>
    totalClassRevenue: number
  }
  payroll: {
    paidAmount: number
    pendingAmount: number
    teacherCountPaid: number
    teacherCountPending: number
    teacherSalaries: Array<{
      id: string
      teacherId: string
      teacherName: string
      email?: string
      salary: number
      status: string
      periodStart: string
      periodEnd: string
    }>
  }
  generatedAt: string
}
