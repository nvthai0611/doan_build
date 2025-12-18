export interface FinancialSummary {
  revenue: {
    totalPaid: number
    monthCollected: number
    prevMonthRevenue: number
    revenueChangePercent: number
    yearlyRevenueChangePercent?: number
    yearlyRevenue?: number
    monthlyTrend: Array<{ label: string; revenue: number; salary: number }>
    yearlyTrend?: Array<{ label: string; revenue: number; salary: number }>
    classRevenue: number
    prevMonthClassRevenue: number
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
    profitChangePercent: number
    yearlyProfitChangePercent?: number
    yearlySalary?: number
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
  students?: {
    totalCount: number
  }
  generatedAt: string
}

export interface OutstandingStudent {
  studentId: string
  studentName: string
  className: string
  totalAmount: number
  records: Array<{
    feeRecordId: string
    amount: number
    dueDate: string
    status: 'pending' | 'processing' | 'overdue'
    createdAt: string
  }>
}
