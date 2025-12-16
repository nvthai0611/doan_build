import { HttpException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { Prisma } from "@prisma/client";
import { EmailNotificationPayrollService } from "../../shared/services/email-notification-payroll.service";
@Injectable()
export class PayRollTeacherService {
  private readonly logger = new Logger(PayRollTeacherService.name);
  constructor(private prisma: PrismaService,
    @InjectQueue('payroll-notification') private readonly payrollQueue: Queue,
    @InjectQueue('payroll-recalculation') private readonly recalculationQueue: Queue,
    private readonly emailService: EmailNotificationPayrollService
  ) { }

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
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum) - 1))
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum), 0))

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
        where: { id: idBig, status: { not: 'cancelled' } },
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

  async dispatchRecalculation(payrollIds: string[]) {
    // 1. Lọc các Payroll hợp lệ (Chỉ status pending hoặc rejected)
    // Chuyển đổi string[] -> bigint[] để query
    const idsBigInt = payrollIds.map(id => {
      try { return BigInt(id); } catch { return null; }
    }).filter(id => id !== null) as bigint[];

    if (idsBigInt.length === 0) {
      throw new HttpException('ID bảng lương không hợp lệ', 400);
    }

    const validPayrolls = await this.prisma.payroll.findMany({
      where: {
        id: { in: idsBigInt },
        status: { in: ['pending', 'rejected_by_teacher'] } // Chỉ cho phép tính lại các trạng thái này
      },
      select: { id: true }
    });

    if (validPayrolls.length === 0) {
      return {
        success: false,
        message: 'Không tìm thấy bảng lương nào hợp lệ để tính lại (Phải ở trạng thái Pending hoặc Rejected)',
        totalRequested: payrollIds.length,
        totalQueued: 0
      };
    }

    // 2. Tạo Job Bulk (Tối ưu hiệu suất hơn loop từng cái)
    const jobs = validPayrolls.map(p => ({
      name: 'recalculate', // Tên process trong worker
      data: { payrollId: p.id.toString() },
      opts: {
        attempts: 3,     // Thử lại 3 lần nếu lỗi
        backoff: 5000,   // Đợi 5s trước khi thử lại
        removeOnComplete: true,
        removeOnFail: false // Giữ lại job lỗi để debug
      }
    }));

    // 3. Đẩy vào Queue
    await this.recalculationQueue.addBulk(jobs);

    this.logger.log(`Đã đẩy ${jobs.length} job tính lại lương vào hàng đợi.`);
    
    // 4. Trả về kết quả
    return {
      success: true,
      message: `Đã tiếp nhận yêu cầu tính lại cho ${jobs.length} bảng lương. Hệ thống đang xử lý, có thể mất vài giây.`,
      totalRequested: payrollIds.length,
      totalQueued: jobs.length,
      ignoredIds: payrollIds.length - jobs.length // Số lượng bị bỏ qua do sai trạng thái
    };
  }

async createPayrollPayment(data: {
    payrollIds: string[]
    totalAmount: number
    paymentMethod: string
    notes?: string
  }, userId: string) {
    try {
      const { payrollIds, totalAmount, paymentMethod, notes } = data;

      // Validate
      if (!payrollIds || payrollIds.length === 0) {
        throw new Error('Danh sách payrollIds không được để trống');
      }

      const idsBigInt = payrollIds.map(id => BigInt(id));

      // Kiểm tra các payroll có tồn tại và ở trạng thái approved_by_teacher
      const payrolls = await this.prisma.payroll.findMany({
        where: {
          id: { in: idsBigInt },
          status: 'approved_by_teacher'
        },
        select: {
          id: true,
          totalAmount: true,
          bonuses: true,
          deductions: true,
          backPayAmount: true,
          periodStart: true,
          periodEnd: true,
          teacherId: true,
          teacher: {
            select: {
              user: { 
                select: { 
                  fullName: true, 
                  email: true 
                } 
              }
            }
          }
        }
      });

      if (payrolls.length === 0) {
        throw new Error('Không tìm thấy bảng lương nào ở trạng thái đã duyệt');
      }

      if (payrolls.length !== payrollIds.length) {
        throw new Error('Một số bảng lương không hợp lệ hoặc chưa được giáo viên duyệt');
      }

      // Kiểm tra tổng tiền
      const calculatedTotal = payrolls.reduce((sum, p) => sum + Number(p.totalAmount), 0);
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        throw new Error(`Tổng tiền không khớp. Tính toán: ${calculatedTotal}, Nhập vào: ${totalAmount}`);
      }

      const paidByUserId = userId;
      const payOutInClass = await this.prisma.teacherSessionPayout.findMany({
        where:{payroll: {id: {in: idsBigInt}}},
        select:{
          teacherPayout: true,
          payoutRate: true        
        }
      })

      const totalPayoutInClass = payOutInClass.reduce((sum, p) => sum + Number(p.teacherPayout), 0);
      // Tạo PayrollPayment
      const payment = await this.prisma.payrollPayment.create({
        data: {
          teacherId: payrolls[0].teacherId,
          paidByUserId,
          totalAmount,
          paymentMethod,
          notes,
          paidAt: new Date()
        }
      });

      // Cập nhật các Payroll
      await this.prisma.payroll.updateMany({
        where: { id: { in: idsBigInt } },
        data: {
          status: 'paid',
          payrollPaymentId: payment.id
        }
      });

      this.logger.log(`✅ Đã tạo thanh toán lương ${payment.id} cho ${payrolls.length} bảng lương`);

      // ✅ Gửi email trực tiếp (không qua queue)
      const teacherInfo = payrolls[0].teacher.user;
      const payrollDetails = payrolls.map(p => ({
        payrollId: p.id.toString(),
        period: `${p.periodStart.toLocaleDateString('vi-VN')} - ${p.periodEnd.toLocaleDateString('vi-VN')}`,
        amount: Number(p.totalAmount),
        bonuses: Number(p.bonuses || 0),
        deductions: Number(p.deductions || 0),
        backPayAmount: Number(p.backPayAmount || 0)
      }));

      try {
        await this.emailService.sendPaymentConfirmationEmail({
          teacherName: teacherInfo.fullName,
          teacherEmail: teacherInfo.email,
          paymentInfo: {
            paymentId: payment.id.toString(),
            totalAmount: payment.totalAmount.toString(),
            paymentMethod: payment.paymentMethod,
            notes: notes,
            paidAt: payment.paidAt.toISOString(),
            payrollDetails: payrollDetails,
            totalPayoutInClass: totalPayoutInClass,
            payRate: payOutInClass.length > 0 ? Number(payOutInClass[0].payoutRate) : null
          }
        });

        this.logger.log(`📧 Đã gửi email thông báo thanh toán cho ${teacherInfo.email}`);
      } catch (emailError: any) {
        // Log lỗi nhưng không throw để không ảnh hưởng đến transaction thanh toán
        this.logger.error(`⚠️ Lỗi khi gửi email xác nhận thanh toán:`, emailError);
      }

      return {
        success: true,
        message: 'Đã tạo giao dịch thanh toán lương thành công. Email xác nhận đã được gửi đến giáo viên.',
        data: {
          paymentId: payment.id.toString(),
          teacherName: teacherInfo.fullName,
          totalAmount: payment.totalAmount,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.paidAt,
          payrollCount: payrolls.length,
          payrollDetails: payrollDetails
        }
      };
    } catch (error: any) {
      this.logger.error('❌ Lỗi khi tạo thanh toán lương:', error);
      throw error;
    }
  }

async applyPayrollAdjustments(data: {
  adjustments: {
    payrollId: string
    items: {
      type: 'bonus' | 'deduction'
      amount: number
      reason: string
    }[]
  }[]
}) {
  try {
    const { adjustments } = data

    if (!adjustments || adjustments.length === 0) {
      throw new Error('Danh sách điều chỉnh không được để trống')
    }

    const results = []

    for (const adj of adjustments) {
      const payrollId = BigInt(adj.payrollId)

      // Lấy payroll hiện tại
      const payroll = await this.prisma.payroll.findUnique({
        where: { id: payrollId },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          bonuses: true,
          deductions: true,
          adjustmentDetails: true,
          teacher: {
            select: {
              user: { select: { fullName: true, email: true } }
            }
          }
        }
      })

      if (!payroll) {
        this.logger.warn(`Payroll ${adj.payrollId} không tồn tại`)
        continue
      }

      if (payroll.status !== 'pending') {
        this.logger.warn(`Payroll ${adj.payrollId} không ở trạng thái pending`)
        continue
      }

      // Lấy adjustment details hiện tại (nếu có)
      const currentAdjustments = (payroll.adjustmentDetails as any) || []
      
      // Thêm adjustment mới
      const newAdjustments = [...currentAdjustments, ...adj.items]

      // Tính lại bonuses và deductions
      let totalBonuses = Number(payroll.bonuses || 0)
      let totalDeductions = Number(payroll.deductions || 0)

      adj.items.forEach(item => {
        if (item.type === 'bonus') {
          totalBonuses += item.amount
        } else {
          totalDeductions += item.amount
        }
      })

      // Tính lại totalAmount
      const baseAmount = Number(payroll.totalAmount) - Number(payroll.bonuses || 0) + Number(payroll.deductions || 0)
      const newTotalAmount = Math.max(0, baseAmount + totalBonuses - totalDeductions)

      // Cập nhật payroll
      await this.prisma.payroll.update({
        where: { id: payrollId },
        data: {
          bonuses: totalBonuses,
          deductions: totalDeductions,
          totalAmount: newTotalAmount,
          adjustmentDetails: newAdjustments as any
        }
      })

      results.push({
        payrollId: adj.payrollId,
        teacherName: payroll.teacher.user.fullName,
        newTotal: newTotalAmount,
        adjustmentsApplied: adj.items.length
      })

      this.logger.log(`✅ Đã áp dụng ${adj.items.length} điều chỉnh cho payroll ${adj.payrollId}`)
    }

    return {
      success: true,
      message: `Đã áp dụng điều chỉnh cho ${results.length} bảng lương`,
      data: results
    }
  } catch (error: any) {
    this.logger.error('❌ Lỗi khi áp dụng điều chỉnh lương:', error)
    throw error
  }

}

}