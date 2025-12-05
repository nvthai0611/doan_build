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
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const paidAgg = await this.prisma.feeRecord.aggregate({
        _sum: { amount: true, scholarship: true, totalAmount: true },
        where: { status: 'paid', dueDate: { gte: start, lte: end } }
      })
      const payrollAgg = await this.prisma.payroll.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'paid', periodStart: { gte: start }, periodEnd: { lte: end } }
      })
      items.push({
        label: `T${start.getMonth() + 1}`,
        revenue: this.resolveAmount(paidAgg),
        salary: toNumber(payrollAgg._sum.totalAmount)
      })
    }
    return items
  }

  async getSummary(month?: string, year?: string) {
    const { start, end } = getTimeBoundary(month, year)

    // Total paid (all time)
    const paidAgg = await this.prisma.feeRecord.aggregate({
      _sum: { amount: true, scholarship: true, totalAmount: true },
      where: { status: 'paid' }
    })

    // Month collected
    const monthPaidAgg = await this.prisma.feeRecord.aggregate({
      _sum: { amount: true, scholarship: true, totalAmount: true },
      where: { status: 'paid', dueDate: { gte: start, lte: end } }
    })

    // Pending & Overdue
    const pendingAgg = await this.prisma.feeRecord.aggregate({
      _sum: { amount: true, scholarship: true, totalAmount: true },
      where: { status: { in: ['pending', 'processing'] } }
    })
    const overdueAgg = await this.prisma.feeRecord.aggregate({
      _sum: { amount: true, scholarship: true, totalAmount: true },
      where: { status: 'overdue' }
    })
    const outstandingStudentsCount = await this.prisma.feeRecord.count({
      where: { status: { in: ['pending', 'overdue'] }, dueDate: { gte: start, lte: end } }
    })

    const totalPaid = this.resolveAmount(paidAgg)
    const monthCollected = this.resolveAmount(monthPaidAgg)
    const pendingAmount = this.resolveAmount(pendingAgg)
    const overdueAmount = this.resolveAmount(overdueAgg)

    const tuitionTotal = totalPaid + pendingAmount + overdueAmount
    const tuitionBreakdownPercent = tuitionTotal > 0 ? {
      paid: Math.round((totalPaid / tuitionTotal) * 100),
      pending: Math.round((pendingAmount / tuitionTotal) * 100),
      overdue: Math.round((overdueAmount / tuitionTotal) * 100)
    } : { paid: 0, pending: 0, overdue: 0 }

    // Class revenue (top 5)
    const classRevenueRaw = await this.prisma.feeRecord.groupBy({
      by: ['classId'],
      where: {
        status: 'paid',
        dueDate: { gte: start, lte: end },
        classId: { not: null }
      },
      _sum: { amount: true, scholarship: true, totalAmount: true },
      _count: { id: true }
    })

    const sortedClassRevenue = classRevenueRaw
      .map(r => ({
        classId: r.classId!,
        revenueAmount: this.resolveAmount(r),
        feeRecordCount: r._count.id
      }))
      .sort((a, b) => b.revenueAmount - a.revenueAmount)

    const classIds = sortedClassRevenue.map(c => c.classId)
    const classes = classIds.length ? await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      select: {
        id: true,
        name: true,
        subject: { select: { name: true } }
      }
    }) : []

    const classMap = new Map(classes.map(c => [c.id, c]))
    const classTopRevenue = sortedClassRevenue.map(c => ({
      classId: c.classId,
      className: classMap.get(c.classId)?.name || 'Lớp chưa xác định',
      subjectName: classMap.get(c.classId)?.subject?.name,
      revenueAmount: c.revenueAmount,
      studentCount: c.feeRecordCount
    }))

    const totalClassRevenue = classTopRevenue.reduce((acc, c) => acc + c.revenueAmount, 0)

    // Get detailed teacher payroll list
    // Build where condition based on time range
    const payrollWhere: any = {}
    if (start && end) {
      // Filter payroll that overlaps with selected period
      payrollWhere.OR = [
        // Period starts within range
        { periodStart: { gte: start, lte: end } },
        // Period ends within range
        { periodEnd: { gte: start, lte: end } },
        // Period encompasses the range
        { AND: [{ periodStart: { lte: start } }, { periodEnd: { gte: end } }] }
      ]
    }

    const payrolls = await this.prisma.payroll.findMany({
      where: payrollWhere,
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
      orderBy: {
        periodStart: 'desc'
      }
    })

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

    console.log('📊 Financial Reports - Payroll Data:', {
      totalPayrolls: payrolls.length,
      teacherSalaries: teacherSalaries.length,
      filterRange: start && end ? `${start.toISOString()} - ${end.toISOString()}` : 'All time',
      sampleData: teacherSalaries.slice(0, 2)
    })

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

    const monthlyTrend = await this.buildMonthlyTrend(12)

    return {
      revenue: {
        totalPaid,
        monthCollected,
        monthlyTrend
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
        teacherSalaries
      },
      generatedAt: new Date().toISOString()
    }
  }
}
