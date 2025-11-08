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
      const whereClause: any = {
          user: {
              isActive: true,
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

      // Nếu không truyền month thì lấy tháng trước làm mặc định
      const getPreviousMonthString = () => {
          const now = new Date()
          const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1)
          const y = lastOfPrevMonth.getFullYear()
          const m = String(lastOfPrevMonth.getMonth() + 1).padStart(2, '0')
          return `${y}-${m}`
      }

      // Helper function để tính ngày bắt đầu và kết thúc tháng
      const getMonthRange = (monthString?: string) => {
          // fallback về tháng trước nếu input không đúng
          const ms = monthString && monthString.includes('-') ? monthString : getPreviousMonthString()
          const [year, monthNum] = ms.split('-')
          const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
          const endDate = new Date(parseInt(year), parseInt(monthNum), 1)
          
          return { startDate, endDate }
      }

      const effectiveMonth = month && month.trim() !== '' ? month : getPreviousMonthString()

      // Build payroll filter conditions
      const payrollFilter: any = {}
      
      if (status) {
          payrollFilter.status = status
      }

      // luôn áp dụng tháng effectiveMonth (tháng truyền vào hoặc mặc định tháng trước)
      if (effectiveMonth) {
           const monthRange = getMonthRange(effectiveMonth)
           payrollFilter.AND = [
               {
                   periodStart: {
                       gte: monthRange.startDate
                   }
               },
               {
                   periodStart: {
                       lt: monthRange.endDate
                   }
               }
           ]
       }

      // Filter teachers that have matching payrolls
      // NOTE: không thêm whereClause.payrolls để KHÔNG loại bỏ teacher không có payroll.
      // Chỉ dùng payrollFilter trong phần include.payrolls để lấy payrolls cho từng teacher.

      const teachers = await this.prisma.teacher.findMany({
          where: whereClause,
          include: {
              user: {
                  select: {
                      id: true,
                      fullName: true,
                      email: true
                  }
              },
              payrolls: {
                  ...(Object.keys(payrollFilter).length > 0 && {
                      where: payrollFilter
                  }),
                  orderBy: {
                      periodStart: 'desc'
                  }
              },
              payrollPayments: true
          }
      })

      const mapped = teachers.map((t: any) => ({
          ...t,
          // nếu không có payroll lấy được cho tháng hiện tại -> để null (user yêu cầu)
          payrolls: Array.isArray(t.payrolls) && t.payrolls.length > 0 ? t.payrolls : null
      }))

      return mapped
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