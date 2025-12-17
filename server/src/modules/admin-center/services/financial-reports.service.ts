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

    // Process each month
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = `T${d.getMonth() + 1}`

      // Calculate shifted boundary for this specific month
      const monthNumber = d.getMonth() + 1 // 1-12
      const yearNumber = d.getFullYear()
      let pm = monthNumber
      let py = yearNumber
      
      // Month M shows feeRecords with dueDate in M+1
      const nextMonth = monthNumber + 1
      const nextYear = yearNumber
      
      const shiftedStart = new Date(nextYear, nextMonth - 1, 1, 0, 0, 0) // nextMonth is 1-12, Date expects 0-11
      const shiftedEnd = new Date(nextYear, nextMonth, 0, 23, 59, 59, 999)

      // Get enrollments and their fee records for this month
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          status: 'studying'
        },
        include: {
          student: {
            include: {
              feeRecords: {
                where: {
                  status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                  dueDate: { gte: shiftedStart, lte: shiftedEnd }
                }
              }
            }
          },
          class: true
        }
      })

      // Calculate revenue using same logic as getClassStudentsStatus
      let monthRevenue = 0
      enrollments.forEach(enrollment => {
        // Filter fee records by classId
        const feeRecords = (enrollment.student.feeRecords || [])
          .filter(fr => fr.classId === enrollment.classId)

        const paidAmount = feeRecords
          .filter(fr => fr.status === 'paid')
          .reduce((sum, fr) => sum + this.resolveAmount({ _sum: { totalAmount: fr.totalAmount } }), 0)

        const pendingRecords = feeRecords.filter(fr => ['pending', 'processing'].includes(fr.status as string))
        const overdueRecords = feeRecords.filter(fr => fr.status === 'overdue')

        const hasPaid = paidAmount > 0
        const hasPending = pendingRecords.length > 0
        const hasOverdue = overdueRecords.length > 0

        // Same status derivation as getClassStudentsStatus
        const enrollmentStatus = hasOverdue
          ? 'overdue'
          : hasPending
          ? 'pending'
          : hasPaid
          ? 'paid'
          : 'unrecorded'

        // Only add revenue if student status is 'paid'
        if (enrollmentStatus === 'paid') {
          monthRevenue += paidAmount
        }
      })

      // Get payroll for this month (using normal boundary, not shifted)
      const monthStart = new Date(yearNumber, monthNumber - 1, 1, 0, 0, 0)
      const monthEnd = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999)

      const payrolls = await this.prisma.payroll.findMany({
        where: {
          status: 'paid',
          periodStart: { gte: monthStart, lte: monthEnd }
        },
        select: {
          totalAmount: true
        }
      })

      const monthSalary = payrolls.reduce((sum, p) => sum + toNumber(p.totalAmount), 0)

      items.push({
        label: monthLabel,
        revenue: monthRevenue,
        salary: monthSalary
      })
    }

    return items
  }

  private async buildYearlyTrend(years: number) {
    const now = new Date()
    const items: Array<{ label: string; revenue: number; salary: number }> = []
    const startYear = now.getFullYear() - (years - 1)

    // Process each year
    for (let y = startYear; y <= now.getFullYear(); y++) {
      const yearStart = new Date(y, 0, 1, 0, 0, 0)
      const yearEnd = new Date(y, 11, 31, 23, 59, 59, 999)

      // Get enrollments and their fee records for this year
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          status: 'studying'
        },
        include: {
          student: {
            include: {
              feeRecords: {
                where: {
                  status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                  dueDate: { gte: yearStart, lte: yearEnd }
                }
              }
            }
          },
          class: true
        }
      })

      // Calculate revenue using same logic as getClassStudentsStatus
      let yearRevenue = 0
      enrollments.forEach(enrollment => {
        // Filter fee records by classId
        const feeRecords = (enrollment.student.feeRecords || [])
          .filter(fr => fr.classId === enrollment.classId)

        const paidAmount = feeRecords
          .filter(fr => fr.status === 'paid')
          .reduce((sum, fr) => sum + this.resolveAmount({ _sum: { totalAmount: fr.totalAmount } }), 0)

        const pendingRecords = feeRecords.filter(fr => ['pending', 'processing'].includes(fr.status as string))
        const overdueRecords = feeRecords.filter(fr => fr.status === 'overdue')

        const hasPaid = paidAmount > 0
        const hasPending = pendingRecords.length > 0
        const hasOverdue = overdueRecords.length > 0

        // Same status derivation as getClassStudentsStatus
        const enrollmentStatus = hasOverdue
          ? 'overdue'
          : hasPending
          ? 'pending'
          : hasPaid
          ? 'paid'
          : 'unrecorded'

        // Only add revenue if student status is 'paid'
        if (enrollmentStatus === 'paid') {
          yearRevenue += paidAmount
        }
      })

      // Get payroll for this year
      const payrolls = await this.prisma.payroll.findMany({
        where: {
          status: 'paid',
          periodStart: { gte: yearStart, lte: yearEnd }
        },
        select: {
          totalAmount: true
        }
      })

      const yearSalary = payrolls.reduce((sum, p) => sum + toNumber(p.totalAmount), 0)

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
      // Yearly trend (last 5 years)
      this.buildYearlyTrend(5),
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
    
    if (yearlyTrend && yearlyTrend.length >= 2) {
      const currentYearData = yearlyTrend[yearlyTrend.length - 1]
      const previousYearData = yearlyTrend[yearlyTrend.length - 2]
      
      if (previousYearData.revenue > 0) {
        yearlyRevenueChangePercent = Math.round(((currentYearData.revenue - previousYearData.revenue) / previousYearData.revenue) * 100)
      }
      
      const currentYearProfit = currentYearData.revenue - currentYearData.salary
      const previousYearProfit = previousYearData.revenue - previousYearData.salary
      
      if (previousYearProfit > 0) {
        yearlyProfitChangePercent = Math.round(((currentYearProfit - previousYearProfit) / previousYearProfit) * 100)
      }
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
        yearlyProfitChangePercent
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

    // Get all enrollments and their fee records for the period (capture paid + unpaid states)
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        status: 'studying'
      },
      include: {
        student: {
          include: {
            user: true,
            feeRecords: {
              where: {
                status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                dueDate: { gte: start, lte: end }
              }
            }
          }
        },
        class: {
          include: {
            subject: true
          }
        }
      }
    })

    // Group by class and calculate stats
    const classMap = new Map<string, {
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
      const key = enrollment.classId
      // Filter fee records by classId to only count fees for this specific class
      const feeRecords = (enrollment.student.feeRecords || [])
        .filter(fr => fr.classId === enrollment.classId)

      const paidAmount = feeRecords
        .filter(fr => fr.status === 'paid')
        .reduce((sum, fr) => sum + this.resolveAmount({ _sum: { totalAmount: fr.totalAmount } }), 0)

      const pendingRecords = feeRecords.filter(fr => ['pending', 'processing'].includes(fr.status as string))
      const overdueRecords = feeRecords.filter(fr => fr.status === 'overdue')

      const hasPaid = paidAmount > 0
      const hasPending = pendingRecords.length > 0
      const hasOverdue = overdueRecords.length > 0

      // Derive a single status per student per class to avoid double-counting
      const enrollmentStatus = hasOverdue
        ? 'overdue'
        : hasPending
        ? 'pending'
        : hasPaid
        ? 'paid'
        : 'unrecorded'

      if (!classMap.has(key)) {
        classMap.set(key, {
          classId: enrollment.classId,
          className: enrollment.class.name,
          subjectName: enrollment.class.subject?.name,
          totalStudents: 0,
          paidStudents: 0,
          unpaidStudents: 0,
          pendingStudents: 0,
          overdueStudents: 0,
          unpaidStudentsList: [],
          totalRevenueAmount: 0
        })
      }

      const classData = classMap.get(key)!
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

    return Array.from(classMap.values())
      .sort((a, b) => {
        // Prioritize classes with unpaid students first
        if ((b.unpaidStudents > 0) !== (a.unpaidStudents > 0)) {
          return (b.unpaidStudents > 0 ? 1 : 0) - (a.unpaidStudents > 0 ? 1 : 0)
        }
        // Within same unpaid status, sort by number of unpaid students (desc), then by revenue (desc)
        if (a.unpaidStudents !== b.unpaidStudents) {
          return b.unpaidStudents - a.unpaidStudents
        }
        return b.totalRevenueAmount - a.totalRevenueAmount
      })
  }
}
