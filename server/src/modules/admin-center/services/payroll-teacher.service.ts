import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
@Injectable()
export class PayRollTeacherService {
  private readonly logger = new Logger(PayRollTeacherService.name);
  constructor(private prisma: PrismaService,
    @InjectQueue('payroll-notification')
    private readonly payrollQueue: Queue,
  ){}

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
            where: { id: idBig, status: {not: 'cancelled'} },
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

      async sendEmailNotificationPayrollTeacher(listPayrollsId: string[]) {
        const startTime = Date.now();
        let executionId: string | null = null;
    
        try {
          if (!listPayrollsId || listPayrollsId.length === 0) {
            throw new Error('Danh sách payroll không được để trống');
          }
    
          const payrollIds = listPayrollsId.map(id => BigInt(id));
    
          const payrolls = await this.prisma.payroll.findMany({
            where: {
              id: { in: payrollIds },
            },
            select: {
              id: true,
              status: true,
              periodStart: true,
              periodEnd: true,
              totalAmount: true,
              bonuses: true,
              deductions: true,
              teacher: {
                select: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          });
    
          if (payrolls.length === 0) {
            throw new Error('Không tìm thấy payroll nào');
          }
    
          const payrollsToNotify = payrolls.filter(p => p.status === 'pending');
    
          if (payrollsToNotify.length === 0) {
            this.logger.warn('Không có payroll nào ở trạng thái pending');
            return {
              success: true,
              message: 'Không có payroll nào ở trạng thái pending để gửi thông báo',
              totalRequested: listPayrollsId.length,
              totalNotified: 0,
            };
          }
    
          // ✅ Tạo CronJobExecution record
          const execution = await this.prisma.cronJobExecution.create({
            data: {
              jobType: 'payroll_notification',
              status: 'running',
              totalItems: payrollsToNotify.length,
              metadata: {
                payrollIds: payrollsToNotify.map(p => p.id.toString()),
                teacherEmails: payrollsToNotify.map(p => p.teacher.user.email),
                executedAt: new Date().toISOString(),
              },
            },
          });
    
          executionId = execution.id;
    
          // ✅ Chuyển BigInt thành string trước khi thêm vào queue
          const jobs = payrollsToNotify.map(payroll =>
            this.payrollQueue.add(
              'send-payroll-notification',
              {
                payrollId: payroll.id.toString(), // ✅ Convert BigInt to string
                executionId: execution.id,
              },
              {
                delay: 1000,
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
              },
            ),
          );
    
          await Promise.all(jobs);
    
          this.logger.log(
            `✅ Đã queue ${payrollsToNotify.length}/${payrolls.length} thông báo payroll`,
          );
    
          return {
            success: true,
            message: `Đã gửi thông báo cho ${payrollsToNotify.length} giáo viên`,
            executionId: execution.id,
            totalRequested: listPayrollsId.length,
            totalProcessed: payrolls.length,
            totalNotified: payrollsToNotify.length,
            notifiedPayrolls: payrollsToNotify.map(p => ({
              payrollId: p.id.toString(),
              teacherName: p.teacher.user.fullName,
              teacherEmail: p.teacher.user.email,
              period: `${p.periodStart.toLocaleDateString('vi-VN')} - ${p.periodEnd.toLocaleDateString('vi-VN')}`,
              totalAmount: p.totalAmount,
            })),
          };
        } catch (error: any) {
          this.logger.error('❌ Lỗi khi gửi thông báo payroll:', error);
    
          // ✅ Cập nhật status execution thành failed
          if (executionId) {
            const durationMs = Date.now() - startTime;
            await this.prisma.cronJobExecution.update({
              where: { id: executionId },
              data: {
                status: 'failed',
                errorMessage: error?.message || 'Unknown error occurred',
                completedAt: new Date(),
                durationMs,
              },
            });
          }
    
          throw error;
        }
      }

// Trong file PayRollTeacherService.ts

  async getPayrollBackPayDetails(payrollId: string) {
    try {
      const idBig = BigInt(payrollId);

      // 1. Lấy Payroll
      const payroll = await this.prisma.payroll.findUnique({
        where: { id: idBig },
        select: {
          id: true,
          teacherId: true,
          periodStart: true,
          periodEnd: true,
          backPayAmount: true,
          computedDetails: true, // JSON chứa backPayDetails
          status: true,
          teacher: {
            select: {
              id: true,
              user: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
      });

      if (!payroll) {
        throw new Error('Không tìm thấy bảng lương');
      }

      // 2. Parse dữ liệu từ JSON computedDetails
      const computedDetails = payroll.computedDetails as any;
      const metadata = computedDetails?.metadata || {};
      const backPayDetailsFromDb = computedDetails?.backPayDetails || [];

      // 3. Lấy danh sách FeeRecordId để truy vấn thông tin bổ sung (Học sinh & Lớp)
      const feeRecordIds = backPayDetailsFromDb
        .map((item: any) => item.feeRecordId)
        .filter(Boolean);

      let feeRecordMap = new Map();
      if (feeRecordIds.length > 0) {
        const feeRecords = await this.prisma.feeRecord.findMany({
          where: { id: { in: feeRecordIds } },
          select: {
            id: true,
            dueDate: true, // Kỳ nợ
            student: {
              select: {
                id: true,
                studentCode: true,
                user: { select: { fullName: true } },
              },
            },
            class: {
              select: {
                id: true,
                name: true,
                classCode: true,
              },
            },
          },
        });
        feeRecordMap = new Map(feeRecords.map((f) => [f.id, f]));
      }

      // 4. Format dữ liệu trả về cho Frontend
      const formattedDetails = backPayDetailsFromDb.map((item: any) => {
        const feeRecord = feeRecordMap.get(item.feeRecordId);

        return {
          // Các trường cơ bản từ JSON
          description: item.description,
          sessionDate: item.sessionDate, // Ngày hóa đơn
          payoutAmount: Number(item.payoutAmount || 0),
          payoutRate: Number(item.payoutRate || 0),
          revenueBase: Number(item.revenuePerSession || 0), // Đây là tổng tiền hóa đơn nợ

          // Thông tin bổ sung từ FeeRecord (nếu tìm thấy)
          source: feeRecord ? {
            type: 'FEE_RECORD',
            feeRecordId: feeRecord.id,
            monthDebt: feeRecord.dueDate, // Quan trọng: Để FE hiển thị kỳ nợ
          } : null,

          student: feeRecord ? {
            id: feeRecord.student.id,
            code: feeRecord.student.studentCode,
            name: feeRecord.student.user.fullName,
          } : null,

          class: feeRecord ? {
            id: feeRecord.class?.id,
            name: feeRecord.class?.name,
            code: feeRecord.class?.classCode,
          } : null,
        };
      });

      // 5. Trả về kết quả
      return {
        data: {
          payroll: {
            id: payroll.id.toString(),
            status: payroll.status,
            periodStart: payroll.periodStart,
            periodEnd: payroll.periodEnd,
          },
          teacher: {
            id: payroll.teacher.id,
            ...payroll.teacher.user,
          },
          backPaySummary: {
            totalBackPayAmount: Number(payroll.backPayAmount || 0),
            count: formattedDetails.length,
            processedAt: metadata.processedAt,
            note: metadata.note 
          },
          backPayDetails: formattedDetails,
        },
        message: 'Chi tiết truy lĩnh được lấy thành công',
      };

    } catch (error) {
      this.logger.error('Error retrieving back pay details:', error);
      throw new Error('Failed to retrieve back pay details');
    }
  }

/**
 * Tính toán thời lượng buổi học (phút)
 */
private calculateDuration(startTime: string, endTime: string): number {
  try {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)

    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    return Math.max(0, endMinutes - startMinutes)
  } catch {
    return 0
  }
}


private mapPayrollBasicInfo(payroll: any) {
    return {
      id: payroll.id.toString(),
      status: payroll.status,
      periodStart: payroll.periodStart,
      periodEnd: payroll.periodEnd,
    };
  }

  private createEmptySummary(payroll: any, metadata: any) {
    return {
      totalBackPayAmount: Number(payroll.backPayAmount || 0),
      count: 0,
      processedAt: metadata.processedAt,
      statistics: { totalRevenue: 0, totalTeacherEarned: 0 },
    };
  }
/**
 * Tính toán tỷ lệ payout trung bình
 */
private calculateAverageRate(details: any[]): number {
  if (details.length === 0) return 0

  const totalRate = details.reduce(
    (sum, item) => sum + (item.backPayInfo?.payoutRate || 0),
    0
  )

  return Math.round((totalRate / details.length) * 10000) / 10000
}
}