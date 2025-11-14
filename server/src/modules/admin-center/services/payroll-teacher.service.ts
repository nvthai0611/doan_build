import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";

@Injectable()
export class PayRollTeacherService {
  constructor(private prisma: PrismaService){}

  async getListTeachers(
      teacherName: string, 
      email: string, 
      status: string,
      month?: string
  ) {
      // Helper function để tính ngày bắt đầu và kết thúc tháng
      const getMonthRange = (monthString?: string) => {
          // Nếu không truyền month thì lấy tháng trước làm mặc định
          if (!monthString || monthString.trim() === '') {
              const now = new Date()
              const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
              const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1)
              const year = lastOfPrevMonth.getFullYear()
              const monthNum = String(lastOfPrevMonth.getMonth() + 1).padStart(2, '0')
              monthString = `${year}-${monthNum}`
          }

          const [year, monthNum] = monthString.split('-')
          const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
          const endDate = new Date(parseInt(year), parseInt(monthNum), 1)
          
          return { startDate, endDate }
      }

      const { startDate, endDate } = getMonthRange(month)

      // Build where clause cho Payroll
      const payrollWhere: any = {
          periodStart: {
              gte: startDate,
              lt: endDate
          }
      }

      // Filter theo status nếu có
      if (status) {
          payrollWhere.status = status
      }

      // Filter theo teacher name/email
      if (teacherName || email) {
          payrollWhere.teacher = {
              user: {
                  ...(teacherName && {
                      fullName: {
                          contains: teacherName,
                          mode: 'insensitive'
                      }
                  }),
                  ...(email && {
                      email: {
                          contains: email,
                          mode: 'insensitive'
                      }
                  })
              }
          }
      }

      // Lấy tất cả payrolls theo điều kiện
      const payrolls = await this.prisma.payroll.findMany({
          where: payrollWhere,
          include: {
              teacher: {
                  include: {
                      user: {
                          select: {
                              id: true,
                              fullName: true,
                              email: true,
                              isActive: true
                          }
                      }
                  }
              },
              payrollPayment: true
          },
          orderBy: {
              periodStart: 'desc'
          }
      })

      // Transform payrolls thành danh sách teachers với payroll info
      const result = payrolls.map(payroll => ({
          id: payroll.teacher.id,
          userId: payroll.teacher.userId,
          teacherCode: payroll.teacher.teacherCode,
          schoolId: payroll.teacher.schoolId,
          subjects: payroll.teacher.subjects,
          createdAt: payroll.teacher.createdAt,
          updatedAt: payroll.teacher.updatedAt,
          user: payroll.teacher.user,
          payroll: {
              id: payroll.id,
              periodStart: payroll.periodStart,
              periodEnd: payroll.periodEnd,
              totalAmount: payroll.totalAmount,
              status: payroll.status,
              adminPublishedAt: payroll.adminPublishedAt,
              teacherActionAt: payroll.teacherActionAt,
          },
          payrollPayment: payroll.payrollPayment
      }))

      return result
  }

      async getAllPayrollsByTeacherId(teacherId: string, year?: string, classId?: string) {
          try {
              const whereClause: any = {
                  teacherId: teacherId
              };

              // filter by year (format "YYYY")
              if (year) {
                  const startDate = new Date(parseInt(year), 0, 1); // January 1st of the year
                  const endDate = new Date(parseInt(year) + 1, 0, 1); // January 1st of the next year
                  whereClause.AND = [
                      { periodStart: { gte: startDate } },
                      { periodStart: { lt: endDate } },
                  ];
              }

              // filter by class via payoutDetails -> session.classId
              if (classId) {
                  whereClause.payoutDetails = {
                      some: {
                          session: {
                              classId: classId
                          }
                      }
                  };
              }

              const payrolls = await this.prisma.payroll.findMany({
                  where: whereClause,
                  include: {
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
                      },
                      payrollPayment: true
                  },
                  orderBy: {
                      periodStart: 'desc'
                  }
              });

              return { data: payrolls, message: 'Payrolls retrieved successfully' };
          } catch (error) {
              console.error('Error retrieving payrolls:', error);
              throw new Error('Failed to retrieve payrolls');
          }
      }

      async getDetailPayrollTeacher(teacherId: string, month?: string, classId?: string) {
          try {
              const whereClause: any = {
                  teacherId: teacherId,
                  ...(classId && { classId: classId }),
              };

              if (month) {
                  const [year, monthNum] = month.split('-');
                  const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                  const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
                  whereClause.periodStart = {
                      gte: startDate,
                      lt: endDate,
                  };
              }

              const payrolls = await this.prisma.payroll.findMany({
                  where: whereClause,
                  include: {
                      teacher: {
                          select: {
                              id: true,
                              user: {
                                  select: {
                                      fullName: true,
                                      email: true,
                                  },
                              },
                          },
                      },
                      payoutDetails:{
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
                      }
                  },
                  orderBy: {
                      periodStart: 'desc',
                  },
              });

              return { data: payrolls, message: 'Payrolls retrieved successfully' };
          } catch (error) {
              console.error('Error retrieving teacher payroll:', error);
              throw new Error('Failed to retrieve payrolls');
          }
      }

      /**
       * Chi tiết 1 payroll theo payrollId
       * Include:
       *  - teacher.user (id, fullName, email)
       *  - payrollPayment (nếu có)
       *  - payoutDetails -> session (sessionDate, startTime, endTime, status)
       *      -> class (id, name, classCode)
       *      -> teacher.user, substituteTeacher.user
       */
      async getPayrollById(payrollId: string) {
        try {
          // Payroll.id là BigInt trong Prisma schema
          const idBig = BigInt(payrollId)
          const payroll = await this.prisma.payroll.findUnique({
            where: { id: idBig },
            include: {
              teacher: {
                select: {
                  id: true,
                  user: {
                    select: { id: true, fullName: true, email: true }
                  }
                }
              },
              payrollPayment: true,
              payoutDetails: {
                include: {
                  session: {
                    select: {
                      id: true,
                      sessionDate: true,
                      startTime: true,
                      endTime: true,
                      status: true,
                      notes: true,
                      class: {
                        select: { id: true, name: true, classCode: true }
                      },
                      teacher: {
                        select: {
                          id: true,
                          user: { select: { id: true, fullName: true, email: true } }
                        }
                      },
                      substituteTeacher: {
                        select: {
                          id: true,
                          user: { select: { id: true, fullName: true, email: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          })
  
          return { data: payroll, message: 'Payroll detail retrieved successfully' }
        } catch (error) {
          console.error('Error retrieving payroll detail:', error)
          throw new Error('Failed to retrieve payroll detail')
        }
      }
  
      /**
       * Lấy chi tiết các buổi học theo classId (để biết GV đã làm gì)
       * Optional filters:
       *  - month: YYYY-MM (lọc theo tháng)
       *  - teacherId: chỉ lấy buổi của GV này (nếu cần)
       * Include:
       *  - class (id, name, classCode)
       *  - teacher.user, substituteTeacher.user
       *  - teacherSessionPayout (nếu có) để xem payout/giờ/số HS
       */
      async getClassSessionsByClassId(classId: string, month?: string, teacherId?: string) {
        try {
          const where: any = { classId }
  
          // filter theo tháng YYYY-MM
          if (month && month.includes('-')) {
            const [year, monthNum] = month.split('-')
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
            const endDate = new Date(parseInt(year), parseInt(monthNum), 1)
            where.sessionDate = {
              gte: startDate,
              lt: endDate
            }
          }
  
          // chỉ lấy buổi của giáo viên cụ thể (nếu truyền)
          if (teacherId) {
            // 1 buổi có thể do teacher hoặc substituteTeacher đảm nhiệm
            where.OR = [
              { teacherId: teacherId },
              { substituteTeacherId: teacherId }
            ]
          }
  
          const sessions = await this.prisma.classSession.findMany({
            where,
            include: {
              class: { select: { id: true, name: true, classCode: true } },
              teacher: {
                select: {
                  id: true,
                  user: { select: { id: true, fullName: true, email: true } }
                }
              },
              substituteTeacher: {
                select: {
                  id: true,
                  user: { select: { id: true, fullName: true, email: true } }
                }
              },
              teacherSessionPayout: {
                select: {
                  id: true,
                  studentCount: true,
                  sessionFeePerStudent: true,
                  totalRevenue: true,
                  payoutRate: true,
                  teacherPayout: true,
                  status: true,
                  calculatedAt: true
                }
              }
            },
            orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }]
          })
  
          return { data: sessions, message: 'Class sessions retrieved successfully' }
        } catch (error) {
          console.error('Error retrieving class sessions by classId:', error)
          throw new Error('Failed to retrieve class sessions')
        }
      }
}