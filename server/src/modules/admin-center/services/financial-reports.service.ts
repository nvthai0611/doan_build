import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../db/prisma.service'
import { Decimal } from '@prisma/client/runtime/library'

interface MonthBoundary {
  start: Date
  end: Date
}

function getTimeBoundary(monthParam?: string, yearParam?: string): { start?: Date; end?: Date } {
  const now = new Date()
  let year = now.getFullYear()
  let monthIndex: number | null = now.getMonth()

  // Parse year if provided
  if (yearParam) {
    const y = Number(yearParam)
    if (!isNaN(y)) {
      year = y
    }
  }

  // Parse month if provided
  if (monthParam) {
    const m = Number(monthParam)
    if (!isNaN(m) && m >= 1 && m <= 12) {
      monthIndex = m - 1
    }
  } else if (yearParam && !monthParam) {
    // If only year is provided, set monthIndex to null for full year query
    monthIndex = null
  }

  // If only year, return year boundaries
  if (monthIndex === null && yearParam) {
    const start = new Date(year, 0, 1, 0, 0, 0)
    const end = new Date(year, 11, 31, 23, 59, 59, 999)
    return { start, end }
  }

  // If no params, return undefined for all-time query
  if (!monthParam && !yearParam) {
    return { start: undefined, end: undefined }
  }

  // Month + optional year
  const start = new Date(year, monthIndex!, 1, 0, 0, 0)
  const end = new Date(year, monthIndex! + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

// For monthly reporting based on policy:
// Recognize tuition in the previous month relative to feeRecord.dueDate
// Example: dueDate in December -> recognized in November report.
// Therefore, when a report requests month M, we filter feeRecords by dueDate in month M+1.
function getShiftedDueBoundary(monthParam?: string, yearParam?: string): { start?: Date; end?: Date } {
  // Only shift when a concrete month is provided. For year-only or all-time, use normal boundary.
  if (!monthParam) {
    return getTimeBoundary(monthParam, yearParam)
  }

  const now = new Date()
  let year = yearParam ? Number(yearParam) : now.getFullYear()
  const m = Number(monthParam)
  if (isNaN(m) || m < 1 || m > 12) {
    return getTimeBoundary(monthParam, yearParam)
  }

  // Next month relative to requested report month
  const nextMonthIndex = m // JS Date month is 0-based; m here is 1-12, so this is next month index
  const start = new Date(year, nextMonthIndex, 1, 0, 0, 0)
  const end = new Date(year, nextMonthIndex + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

function toNumber(d?: Decimal | null): number {
  if (!d) return 0
  try {
    return (d as any).toNumber ? (d as any).toNumber() : Number(d)
  } catch {
    return Number(d)
  }
}

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveAmount(agg: any): number {
    const totalAmount = toNumber(agg._sum?.totalAmount)
    if (totalAmount) return totalAmount
    const amount = toNumber(agg._sum?.amount)
    const scholarship = toNumber(agg._sum?.scholarship)
    return amount - scholarship
  }

  private async buildMonthlyTrend(months: number) {
    const now = new Date()
    const items: Array<{ label: string; revenue: number; salary: number }> = []

    // Calculate date range for all months at once
    const oldestDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
    const newestDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999) // +2 for shift

    // Fetch ALL relevant data in one query
    const [allFeeRecords, allPayrolls, enrollments] = await Promise.all([
      this.prisma.feeRecord.findMany({
        where: {
          status: { in: ['paid', 'pending', 'processing', 'overdue'] },
          dueDate: { gte: oldestDate, lte: newestDate }
        },
        select: {
          status: true,
          totalAmount: true,
          dueDate: true,
          classId: true,
          studentId: true
        }
      }),
      this.prisma.payroll.findMany({
        where: {
          status: 'paid',
          periodStart: { gte: oldestDate, lte: newestDate }
        },
        select: {
          totalAmount: true,
          periodStart: true
        }
      }),
      this.prisma.enrollment.findMany({
        where: { status: 'studying' },
        select: {
          classId: true,
          studentId: true
        }
      })
    ])

    // Create enrollment lookup set for O(1) access
    const enrollmentSet = new Set(
      enrollments.map(e => `${e.studentId}-${e.classId}`)
    )

    // Pre-group fee records by yearMonth-studentId-classId for O(1) lookup
    const feeRecordsByKey = new Map<string, typeof allFeeRecords>()
    allFeeRecords.forEach(fr => {
      if (!fr.classId || !fr.studentId) return
      const yearMonth = `${fr.dueDate.getFullYear()}-${fr.dueDate.getMonth()}`
      const key = `${yearMonth}-${fr.studentId}-${fr.classId}`
      if (!feeRecordsByKey.has(key)) {
        feeRecordsByKey.set(key, [])
      }
      feeRecordsByKey.get(key)!.push(fr)
    })

    // Pre-group payrolls by yearMonth for O(1) lookup
    const payrollsByMonth = new Map<string, number>()
    allPayrolls.forEach(p => {
      const yearMonth = `${p.periodStart.getFullYear()}-${p.periodStart.getMonth()}`
      payrollsByMonth.set(yearMonth, (payrollsByMonth.get(yearMonth) || 0) + toNumber(p.totalAmount))
    })

    // Process each month
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = `T${d.getMonth() + 1}`
      const monthNumber = d.getMonth() + 1
      const yearNumber = d.getFullYear()

      // Month M shows feeRecords with dueDate in M+1
      const nextMonth = (monthNumber % 12) + 1
      const nextYear = nextMonth === 1 ? yearNumber + 1 : yearNumber
      const shiftedYearMonth = `${nextYear}-${nextMonth - 1}` // JS month is 0-based

      // Calculate revenue by iterating enrolled students
      let monthRevenue = 0
      const processedStudents = new Set<string>()
      
      enrollments.forEach(enrollment => {
        const studentClassKey = `${enrollment.studentId}-${enrollment.classId}`
        if (!enrollmentSet.has(studentClassKey)) return
        
        const uniqueKey = `${shiftedYearMonth}-${studentClassKey}`
        if (processedStudents.has(uniqueKey)) return
        processedStudents.add(uniqueKey)

        const feeRecords = feeRecordsByKey.get(`${shiftedYearMonth}-${studentClassKey}`) || []
        if (feeRecords.length === 0) return

        const paidAmount = feeRecords
          .filter(fr => fr.status === 'paid')
          .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0)

        const hasPending = feeRecords.some(fr => ['pending', 'processing'].includes(fr.status))
        const hasOverdue = feeRecords.some(fr => fr.status === 'overdue')

        const enrollmentStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : paidAmount > 0 ? 'paid' : 'unrecorded'

        if (enrollmentStatus === 'paid') {
          monthRevenue += paidAmount
        }
      })

      // Get salary from pre-calculated map
      const salaryYearMonth = `${yearNumber}-${monthNumber - 1}`
      const monthSalary = payrollsByMonth.get(salaryYearMonth) || 0

      items.push({
        label: monthLabel,
        revenue: monthRevenue,
        salary: monthSalary
      })
    }

    return items
  }

  private async buildYearlyTrend(years: number, selectedYear?: number) {
    const now = new Date()
    const endYear = selectedYear || now.getFullYear()
    const startYear = endYear - (years - 1)
    const items: Array<{ label: string; revenue: number; salary: number }> = []

    // Calculate date range for all years at once (need extra month for shift)
    const oldestDate = new Date(startYear, 1, 1, 0, 0, 0) // Feb of start year
    const newestDate = new Date(endYear + 1, 1, 0, 23, 59, 59, 999) // End of Jan next year

    // Fetch ALL data in 3 parallel queries
    const [allFeeRecords, allPayrolls, enrollments] = await Promise.all([
      this.prisma.feeRecord.findMany({
        where: {
          status: { in: ['paid', 'pending', 'processing', 'overdue'] },
          dueDate: { gte: oldestDate, lte: newestDate }
        },
        select: {
          status: true,
          totalAmount: true,
          dueDate: true,
          classId: true,
          studentId: true
        }
      }),
      this.prisma.payroll.findMany({
        where: {
          status: 'paid',
          periodStart: { gte: new Date(startYear, 0, 1), lte: new Date(endYear, 11, 31, 23, 59, 59, 999) }
        },
        select: {
          totalAmount: true,
          periodStart: true
        }
      }),
      this.prisma.enrollment.findMany({
        where: { status: 'studying' },
        select: {
          classId: true,
          studentId: true
        }
      })
    ])

    // Create enrollment lookup set for O(1) access
    const enrollmentSet = new Set(
      enrollments.map(e => `${e.studentId}-${e.classId}`)
    )

    // Pre-group fee records by yearMonth-studentId-classId for O(1) lookup
    const feeRecordsByKey = new Map<string, typeof allFeeRecords>()
    allFeeRecords.forEach(fr => {
      if (!fr.classId || !fr.studentId) return
      const yearMonth = `${fr.dueDate.getFullYear()}-${fr.dueDate.getMonth()}`
      const key = `${yearMonth}-${fr.studentId}-${fr.classId}`
      if (!feeRecordsByKey.has(key)) {
        feeRecordsByKey.set(key, [])
      }
      feeRecordsByKey.get(key)!.push(fr)
    })

    // Pre-group payrolls by yearMonth for O(1) lookup
    const payrollsByMonth = new Map<string, number>()
    allPayrolls.forEach(p => {
      const yearMonth = `${p.periodStart.getFullYear()}-${p.periodStart.getMonth()}`
      payrollsByMonth.set(yearMonth, (payrollsByMonth.get(yearMonth) || 0) + toNumber(p.totalAmount))
    })

    // Process each year by summing up 12 months
    for (let y = startYear; y <= endYear; y++) {
      let yearRevenue = 0
      let yearSalary = 0

      // Process all 12 months for this year
      for (let month = 1; month <= 12; month++) {
        // Month M shows feeRecords with dueDate in M+1
        const nextMonth = (month % 12) + 1
        const nextYear = nextMonth === 1 ? y + 1 : y
        const shiftedYearMonth = `${nextYear}-${nextMonth - 1}` // JS month is 0-based

        // Calculate revenue by iterating enrolled students (O(enrollments) instead of O(feeRecords))
        const processedStudents = new Set<string>()
        
        enrollments.forEach(enrollment => {
          const studentClassKey = `${enrollment.studentId}-${enrollment.classId}`
          if (!enrollmentSet.has(studentClassKey)) return
          
          const uniqueKey = `${shiftedYearMonth}-${studentClassKey}`
          if (processedStudents.has(uniqueKey)) return
          processedStudents.add(uniqueKey)

          const feeRecords = feeRecordsByKey.get(`${shiftedYearMonth}-${studentClassKey}`) || []
          if (feeRecords.length === 0) return

          const paidAmount = feeRecords
            .filter(fr => fr.status === 'paid')
            .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0)

          const hasPending = feeRecords.some(fr => ['pending', 'processing'].includes(fr.status))
          const hasOverdue = feeRecords.some(fr => fr.status === 'overdue')

          const enrollmentStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : paidAmount > 0 ? 'paid' : 'unrecorded'

          if (enrollmentStatus === 'paid') {
            yearRevenue += paidAmount
          }
        })

        // Get salary from pre-calculated map
        const salaryYearMonth = `${y}-${month - 1}`
        yearSalary += payrollsByMonth.get(salaryYearMonth) || 0
      }

      items.push({
        label: String(y),
        revenue: yearRevenue,
        salary: yearSalary
      })
    }

    return items
  }

  async getSummary(month?: string, year?: string) {
    // Report window (for payrolls, UI labels, etc.)
    const { start, end } = getTimeBoundary(month, year)
    // Due date window (shifted +1 month for fee records recognition)
    const { start: dueStart, end: dueEnd } = getShiftedDueBoundary(month, year)

    // Calculate previous month boundaries
    // Previous reporting month for payroll (use normal boundary, not shifted)
    let prevPayrollStart: Date | undefined
    let prevPayrollEnd: Date | undefined
    if (month && year) {
      let pm = Number(month) - 1
      let py = Number(year)
      if (pm <= 0) { pm = 12; py = py - 1 }
      const prevBoundary = getTimeBoundary(String(pm), String(py))
      prevPayrollStart = prevBoundary.start
      prevPayrollEnd = prevBoundary.end
    }

    // Previous month boundaries for fee records (shifted)
    let prevStart: Date | undefined
    let prevEnd: Date | undefined
    if (month && year) {
      let pm = Number(month) - 1
      let py = Number(year)
      if (pm <= 0) { pm = 12; py = py - 1 }
      const prevDue = getShiftedDueBoundary(String(pm), String(py))
      prevStart = prevDue.start
      prevEnd = prevDue.end
    }

    // Run all independent queries in parallel
    const [
      paidAgg,
      monthPaidAgg,
      prevMonthPaidAgg,
      prevMonthPayrollAgg,
      pendingAgg,
      overdueAgg,
      outstandingStudentsCount,
      classRevenueRaw,
      prevMonthClassRevenueRaw,
      payrolls,
      monthlyTrend,
      yearlyTrend,
      studentsTotalCount
    ] = await Promise.all([
      // Total paid (all time)
      this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: 'paid' }
      }),
      // Month collected
      this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: 'paid', dueDate: { gte: dueStart, lte: dueEnd } }
      }),
      // Previous month revenue
      prevStart && prevEnd ? this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: 'paid', dueDate: { gte: prevStart, lte: prevEnd } }
      }) : Promise.resolve({ _sum: { totalAmount: null } }),
      // Previous month payroll (filter by periodStart to match the report month)
      prevPayrollStart && prevPayrollEnd ? this.prisma.payroll.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'paid', periodStart: { gte: prevPayrollStart, lte: prevPayrollEnd } }
      }) : Promise.resolve({ _sum: { totalAmount: null } }),
      // Pending
      this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: { in: ['pending', 'processing'] }, dueDate: { gte: dueStart, lte: dueEnd } }
      }),
      // Overdue
      this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: 'overdue', dueDate: { gte: dueStart, lte: dueEnd } }
      }),
      // Outstanding students count
      this.prisma.feeRecord.count({
        where: { status: 'overdue', dueDate: { gte: dueStart, lte: dueEnd } }
      }),
      // Class revenue
      this.prisma.feeRecord.groupBy({
        by: ['classId'],
        where: {
          status: 'paid',
          dueDate: { gte: dueStart, lte: dueEnd },
          classId: { not: null }
        },
        _sum: { amount: true, scholarship: true, totalAmount: true },
        _count: { id: true }
      }),
      // Previous month class revenue
      prevStart && prevEnd ? this.prisma.feeRecord.groupBy({
        by: ['classId'],
        where: {
          status: 'paid',
          dueDate: { gte: prevStart, lte: prevEnd },
          classId: { not: null }
        },
        _sum: { amount: true, scholarship: true, totalAmount: true },
        _count: { id: true }
      }) : Promise.resolve([]),
      // Payrolls (filter by periodStart - month M shows payroll with periodStart in M)
      this.prisma.payroll.findMany({
        where: start && end ? {
          periodStart: { gte: start, lte: end }
        } : {},
        select: {
          id: true,
          totalAmount: true,
          status: true,
          periodStart: true,
          periodEnd: true,
          teacherId: true,
          teacher: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { periodStart: 'desc' }
      }),
      // Monthly trend
      this.buildMonthlyTrend(12),
      // Yearly trend (last 5 years from selected year or current year)
      this.buildYearlyTrend(5, year ? Number(year) : undefined),
      // Total students (all time)
      this.prisma.student.count()
    ])

    const totalPaid = this.resolveAmount(paidAgg)
    const monthCollected = this.resolveAmount(monthPaidAgg)
    const prevMonthRevenue = this.resolveAmount(prevMonthPaidAgg)
    const prevMonthSalary = toNumber(prevMonthPayrollAgg._sum?.totalAmount)
    const pendingAmount = this.resolveAmount(pendingAgg)
    const overdueAmount = this.resolveAmount(overdueAgg)

    // Calculate month-over-month revenue percentage
    const revenueChangePercent = prevMonthRevenue > 0 ? Math.round(((monthCollected - prevMonthRevenue) / prevMonthRevenue) * 100) : 0

    // Breakdown uses period-limited paid + pending + overdue
    const periodPaid = monthCollected
    const tuitionTotal = periodPaid + pendingAmount + overdueAmount
    const tuitionBreakdownPercent = (() => {
      if (tuitionTotal <= 0) return { paid: 0, pending: 0, overdue: 0 }
      const paid = Math.round((periodPaid / tuitionTotal) * 100)
      const pending = Math.round((pendingAmount / tuitionTotal) * 100)
      // Keep total at 100, absorb rounding into overdue
      const overdue = Math.max(0, 100 - paid - pending)
      return { paid, pending, overdue }
    })()

    const sortedClassRevenue = classRevenueRaw
      .map(r => ({
        classId: r.classId!,
        revenueAmount: this.resolveAmount(r),
        feeRecordCount: r._count.id
      }))
      .sort((a, b) => b.revenueAmount - a.revenueAmount)

    const classIds = sortedClassRevenue.map(c => c.classId)
    
    // Fetch class details and count unique students per class
    const [classes, studentCounts] = await Promise.all([
      classIds.length ? this.prisma.class.findMany({
        where: { id: { in: classIds } },
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } }
        }
      }) : Promise.resolve([]),
      classIds.length ? Promise.all(
        classIds.map(classId =>
          this.prisma.feeRecord.findMany({
            where: {
              classId,
              status: 'paid',
              dueDate: { gte: start, lte: end }
            },
            select: { studentId: true },
            distinct: ['studentId']
          }).then(records => ({ classId, count: records.length }))
        )
      ) : Promise.resolve([])
    ])

    const classMap = new Map(classes.map(c => [c.id, c]))
    const studentCountMap = new Map(studentCounts.map(sc => [sc.classId, sc.count]))
    
    const classTopRevenue = sortedClassRevenue.map(c => ({
      classId: c.classId,
      className: classMap.get(c.classId)?.name || 'Lớp chưa xác định',
      subjectName: classMap.get(c.classId)?.subject?.name,
      revenueAmount: c.revenueAmount,
      studentCount: studentCountMap.get(c.classId) || 0
    }))

    const totalClassRevenue = classTopRevenue.reduce((acc, c) => acc + c.revenueAmount, 0)

    // Calculate previous month class revenue total
    const prevMonthClassRevenueTotal = (prevMonthClassRevenueRaw || [])
      .reduce((acc, r) => acc + this.resolveAmount(r), 0)

    const teacherSalaries = payrolls.map(p => ({
      id: p.id,
      teacherId: p.teacher.id,
      teacherName: p.teacher.user.fullName || 'Chưa cập nhật',
      email: p.teacher.user.email,
      salary: toNumber(p.totalAmount),
      status: p.status,
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString()
    }))

    const payrollPaidAmount = teacherSalaries
      .filter(t => t.status === 'paid')
      .reduce((acc, t) => acc + t.salary, 0)
    
    const payrollPendingAmount = teacherSalaries
      .filter(t => ['pending', 'waiting_teacher_approval', 'approved_by_teacher'].includes(t.status))
      .reduce((acc, t) => acc + t.salary, 0)
    
    const teacherCountPaid = teacherSalaries.filter(t => t.status === 'paid').length
    const teacherCountPending = teacherSalaries.filter(t => 
      ['pending', 'waiting_teacher_approval', 'approved_by_teacher'].includes(t.status)
    ).length

    // Calculate profit change percentage
    const currentProfit = payrollPaidAmount > 0 ? monthCollected - payrollPaidAmount : monthCollected
    const prevMonthProfit = prevMonthRevenue - prevMonthSalary
    const profitChangePercent = prevMonthProfit > 0 ? Math.round(((currentProfit - prevMonthProfit) / prevMonthProfit) * 100) : 0

    // Calculate year-over-year change percentages
    let yearlyRevenueChangePercent = 0
    let yearlyProfitChangePercent = 0
    let selectedYearRevenue = 0
    let selectedYearSalary = 0
    
    if (yearlyTrend && yearlyTrend.length >= 2) {
      // When year is specified, compare the selected year with its previous year
      // Otherwise, compare current year with previous year
      const currentYearData = yearlyTrend[yearlyTrend.length - 1]
      const previousYearData = yearlyTrend[yearlyTrend.length - 2]
      
      selectedYearRevenue = currentYearData.revenue
      selectedYearSalary = currentYearData.salary
      
      if (previousYearData.revenue > 0) {
        yearlyRevenueChangePercent = Math.round(((currentYearData.revenue - previousYearData.revenue) / previousYearData.revenue) * 100)
      }
      
      const currentYearProfit = currentYearData.revenue - currentYearData.salary
      const previousYearProfit = previousYearData.revenue - previousYearData.salary
      
      if (previousYearProfit > 0) {
        yearlyProfitChangePercent = Math.round(((currentYearProfit - previousYearProfit) / previousYearProfit) * 100)
      }
    } else if (yearlyTrend && yearlyTrend.length === 1) {
      selectedYearRevenue = yearlyTrend[0].revenue
      selectedYearSalary = yearlyTrend[0].salary
    }

    return {
      revenue: {
        totalPaid,
        monthCollected,
        prevMonthRevenue,
        monthlyTrend,
        yearlyTrend,
        revenueChangePercent,
        yearlyRevenueChangePercent,
        yearlyRevenue: selectedYearRevenue,
        classRevenue: totalClassRevenue,
        prevMonthClassRevenue: prevMonthClassRevenueTotal
      },
      tuition: {
        paidAmount: totalPaid,
        pendingAmount,
        overdueAmount,
        breakdownPercent: tuitionBreakdownPercent,
        outstandingStudentsCount
      },
      classes: {
        topRevenue: classTopRevenue,
        totalClassRevenue
      },
      payroll: {
        paidAmount: payrollPaidAmount,
        pendingAmount: payrollPendingAmount,
        teacherCountPaid,
        teacherCountPending,
        teacherSalaries,
        profitChangePercent,
        yearlyProfitChangePercent,
        yearlySalary: selectedYearSalary
      },
      students: {
        totalCount: studentsTotalCount
      },
      generatedAt: new Date().toISOString()
    }
  }

  async getOutstandingStudents(month?: string, year?: string): Promise<any[]> {
    const { start, end } = getShiftedDueBoundary(month, year)

    // Get all pending/processing and overdue tuition records for the period
    const outstandingRecords = await this.prisma.feeRecord.findMany({
      where: {
        status: { in: ['pending', 'processing', 'overdue'] },
        dueDate: { gte: start, lte: end }
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: {
                class: true
              },
              where: {
                status: 'studying'
              },
              orderBy: {
                enrolledAt: 'desc'
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'desc' }, // overdue first
        { dueDate: 'asc' }  // older due dates first
      ]
    })

    // Group by student and sum amounts
    const groupedByStudent = new Map<string, {
      studentId: string
      studentName: string
      classes: string[]
      totalAmount: number
      records: any[]
    }>()

    outstandingRecords.forEach(record => {
      const key = record.studentId
      const amount = this.resolveAmount({ _sum: { totalAmount: record.totalAmount } })
      
      if (!groupedByStudent.has(key)) {
        const classes = (record.student?.enrollments || [])
          .map(e => e.class?.name)
          .filter(Boolean) as string[]

        groupedByStudent.set(key, {
          studentId: record.studentId,
          studentName: record.student?.user?.fullName || 'N/A',
          classes,
          totalAmount: 0,
          records: []
        })
      }

      const group = groupedByStudent.get(key)!
      group.totalAmount += amount
      // Try to infer the class name from enrollments (if feeRecord links to class via context)
      const classNameFromEnrollments = (record.student?.enrollments || [])
        .map(e => e.class?.name)
        .filter(Boolean)[0] || null

      group.records.push({
        feeRecordId: record.id,
        amount,
        dueDate: record.dueDate,
        status: record.status,
        createdAt: record.createdAt,
        className: classNameFromEnrollments
      })
    })

    // Convert to array and sort by total amount (highest first)
    return Array.from(groupedByStudent.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }

  private async getStudentsByStatus(statuses: string[], month?: string, year?: string): Promise<any[]> {
    const { start, end } = getShiftedDueBoundary(month, year)

    const records = await this.prisma.feeRecord.findMany({
      where: {
        status: { in: statuses },
        dueDate: { gte: start, lte: end }
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: {
                class: true
              },
              where: {
                status: 'studying'
              },
              orderBy: {
                enrolledAt: 'desc'
              }
            }
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' }  // older due dates first
      ]
    })

    const groupedByStudent = new Map<string, {
      studentId: string
      studentName: string
      classes: string[]
      totalAmount: number
      records: any[]
    }>()

    records.forEach(record => {
      const key = record.studentId
      const amount = this.resolveAmount({ _sum: { totalAmount: record.totalAmount } })
      
      if (!groupedByStudent.has(key)) {
        const classes = (record.student?.enrollments || [])
          .map(e => e.class?.name)
          .filter(Boolean) as string[]

        groupedByStudent.set(key, {
          studentId: record.studentId,
          studentName: record.student?.user?.fullName || 'N/A',
          classes,
          totalAmount: 0,
          records: []
        })
      }

      const group = groupedByStudent.get(key)!
      group.totalAmount += amount
      
      const classNameFromEnrollments = (record.student?.enrollments || [])
        .map(e => e.class?.name)
        .filter(Boolean)[0] || null

      group.records.push({
        feeRecordId: record.id,
        amount,
        dueDate: record.dueDate,
        status: record.status,
        createdAt: record.createdAt,
        className: classNameFromEnrollments
      })
    })

    return Array.from(groupedByStudent.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }

  async getOverdueStudents(month?: string, year?: string): Promise<any[]> {
    return this.getStudentsByStatus(['overdue'], month, year)
  }

  async getPendingStudents(month?: string, year?: string): Promise<any[]> {
    return this.getStudentsByStatus(['pending', 'processing'], month, year)
  }

  async getClassStudentsStatus(month?: string, year?: string): Promise<any[]> {
    const { start, end } = getShiftedDueBoundary(month, year)

    // Fetch data in parallel
    const [enrollments, feeRecords, classes] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { status: 'studying' },
        select: {
          classId: true,
          studentId: true,
          student: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      this.prisma.feeRecord.findMany({
        where: {
          status: { in: ['paid', 'pending', 'processing', 'overdue'] },
          dueDate: { gte: start, lte: end }
        },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          classId: true,
          studentId: true
        }
      }),
      this.prisma.class.findMany({
        select: {
          id: true,
          name: true,
          subject: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Create lookups
    const classMap = new Map(classes.map(c => [c.id, c]))
    const feeRecordsByStudentClass = new Map<string, typeof feeRecords>()
    
    feeRecords.forEach(fr => {
      if (!fr.classId || !fr.studentId) return
      const key = `${fr.studentId}-${fr.classId}`
      if (!feeRecordsByStudentClass.has(key)) {
        feeRecordsByStudentClass.set(key, [])
      }
      feeRecordsByStudentClass.get(key)!.push(fr)
    })

    // Group by class
    const classDataMap = new Map<string, {
      classId: string
      className: string
      subjectName?: string
      totalStudents: number
      paidStudents: number
      unpaidStudents: number
      pendingStudents: number
      overdueStudents: number
      unpaidStudentsList: any[]
      totalRevenueAmount: number
    }>()

    enrollments.forEach(enrollment => {
      const classId = enrollment.classId
      const key = `${enrollment.studentId}-${classId}`
      const feeRecordsForEnrollment = feeRecordsByStudentClass.get(key) || []

      const paidAmount = feeRecordsForEnrollment
        .filter(fr => fr.status === 'paid')
        .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0)

      const hasPending = feeRecordsForEnrollment.some(fr => ['pending', 'processing'].includes(fr.status))
      const hasOverdue = feeRecordsForEnrollment.some(fr => fr.status === 'overdue')

      const enrollmentStatus = hasOverdue
        ? 'overdue'
        : hasPending
        ? 'pending'
        : paidAmount > 0
        ? 'paid'
        : 'unrecorded'

      if (!classDataMap.has(classId)) {
        const classInfo = classMap.get(classId)
        classDataMap.set(classId, {
          classId,
          className: classInfo?.name || 'Lớp chưa xác định',
          subjectName: classInfo?.subject?.name,
          totalStudents: 0,
          paidStudents: 0,
          unpaidStudents: 0,
          pendingStudents: 0,
          overdueStudents: 0,
          unpaidStudentsList: [],
          totalRevenueAmount: 0
        })
      }

      const classData = classDataMap.get(classId)!
      classData.totalStudents += 1

      if (enrollmentStatus === 'paid') {
        classData.paidStudents += 1
        classData.totalRevenueAmount += paidAmount
      }

      if (enrollmentStatus === 'pending') {
        classData.unpaidStudents += 1
        classData.pendingStudents += 1
        classData.unpaidStudentsList.push({
          studentId: enrollment.student.id,
          studentName: enrollment.student.user.fullName || 'Chưa cập nhật',
          email: enrollment.student.user.email
        })
      }

      if (enrollmentStatus === 'overdue') {
        classData.unpaidStudents += 1
        classData.overdueStudents += 1
        classData.unpaidStudentsList.push({
          studentId: enrollment.student.id,
          studentName: enrollment.student.user.fullName || 'Chưa cập nhật',
          email: enrollment.student.user.email
        })
      }
    })

    return Array.from(classDataMap.values())
      .sort((a, b) => {
        if ((b.unpaidStudents > 0) !== (a.unpaidStudents > 0)) {
          return (b.unpaidStudents > 0 ? 1 : 0) - (a.unpaidStudents > 0 ? 1 : 0)
        }
        if (a.unpaidStudents !== b.unpaidStudents) {
          return b.unpaidStudents - a.unpaidStudents
        }
        return b.totalRevenueAmount - a.totalRevenueAmount
      })
  }
}
