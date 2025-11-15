import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../db/prisma.service'

interface GetTeacherPayrollParams {
  teacherId: string
  month?: string
  status?: string
  page?: number
  limit?: number
}

interface GetPayrollDetailParams {
  payrollId: string
  classId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

interface PayrollResponse {
  data: any[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  message: string
}

interface PayrollDetailResponse {
  payroll: any
  sessions: any[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  summary: {
    totalSessions: number
    totalPayout: number
    regularSessions: number
    substituteSessions: number
  }
  message: string
}

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getTeacherPayroll(params: GetTeacherPayrollParams): Promise<PayrollResponse> {
    try {
      const {
        teacherId,
        month,
        status,
        page = 1,
        limit = 10
      } = params

      const where: any = {
        teacherId,
        status: { not: 'pending' }
      }

      if (month && month.match(/^\d{4}-\d{2}$/)) {
        const [year, monthNum] = month.split('-')
        const startDate = new Date(`${year}-${monthNum}-01`)
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

        where.periodStart = {
          gte: startDate,
          lte: endDate
        }
      }

      if (status && status !== 'all') {
        where.status = status
      }

      const skip = (page - 1) * limit
      const take = limit

      const [payrolls, totalItems] = await Promise.all([
        this.prisma.payroll.findMany({
          where,
          include: {
            payoutDetails: {
              include: {
                session: {
                  include: {
                    class: {
                      select: {
                        id: true,
                        name: true,
                        classCode: true
                      }
                    }
                  }
                }
              }
            },
            teacher: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: [
            { periodEnd: 'desc' },
            { id: 'desc' }
          ],
          skip,
          take
        }),
        this.prisma.payroll.count({ where })
      ])

      const totalPages = Math.ceil(totalItems / limit)

      return {
        data: payrolls,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        },
        message: 'Lấy danh sách lương thành công'
      }
    } catch (error) {
      console.error('Error getting teacher payroll:', error)
      throw error
    }
  }

  async getPayrollDetail(params: GetPayrollDetailParams): Promise<PayrollDetailResponse> {
    try {
      const {
        payrollId,
        classId,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = params

      // ✅ Lấy thông tin payroll cơ bản
      const payroll = await this.prisma.payroll.findUnique({
        where: { id: BigInt(payrollId) },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!payroll) {
        throw new Error('Payroll không tìm thấy')
      }

      // ✅ Xây dựng điều kiện filter cho sessions
      const sessionWhere: any = {
        payrollId: BigInt(payrollId)
      }

      // ✅ Filter theo classId
      if (classId) {
        sessionWhere.session = {
          classId
        }
      }

      // ✅ Filter theo date range
      if (startDate || endDate) {
        sessionWhere.session = {
          ...sessionWhere.session,
          sessionDate: {}
        }

        if (startDate) {
          sessionWhere.session.sessionDate.gte = new Date(startDate)
        }

        if (endDate) {
          sessionWhere.session.sessionDate.lte = new Date(endDate)
        }
      }

      // ✅ Đếm tổng số sessions
      const totalSessions = await this.prisma.teacherSessionPayout.count({
        where: sessionWhere
      })

      // ✅ Lấy sessions với phân trang
      const skip = (page - 1) * limit
      const sessions = await this.prisma.teacherSessionPayout.findMany({
        where: sessionWhere,
        include: {
          session: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  classCode: true
                }
              }
            }
          }
        },
        orderBy: [
          { session: { sessionDate: 'desc' } }
        ],
        skip,
        take: limit
      })

      // ✅ Tính toán summary - SỬA LẠI: Lấy isSubstitute từ ClassSession
      const allSessions = await this.prisma.teacherSessionPayout.findMany({
        where: sessionWhere,
        select: {
          teacherPayout: true,
          session: {
            select: {
              substituteTeacherId: true, // ✅ Lấy substituteTeacherId từ ClassSession
              teacherId: true            // ✅ Lấy teacherId chính thức
            }
          }
        }
      })

      const summary = {
        totalSessions: allSessions.length,
        totalPayout: allSessions.reduce(
          (sum, s) => sum + Number(s.teacherPayout),
          0
        ),
        // ✅ Buổi học chính thức: teacherId = giáo viên trong payroll VÀ KHÔNG có substituteTeacherId
        regularSessions: allSessions.filter(s => 
          s.session.teacherId === payroll.teacherId && 
          !s.session.substituteTeacherId
        ).length,
        // ✅ Buổi dạy thay: substituteTeacherId = giáo viên trong payroll
        substituteSessions: allSessions.filter(s => 
          s.session.substituteTeacherId === payroll.teacherId
        ).length
      }

      const totalPages = Math.ceil(totalSessions / limit)

      return {
        payroll,
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalSessions,
          itemsPerPage: limit
        },
        summary,
        message: 'Lấy chi tiết lương thành công'
      }
    } catch (error) {
      console.error('Error getting payroll detail:', error)
      throw error
    }
  }
}