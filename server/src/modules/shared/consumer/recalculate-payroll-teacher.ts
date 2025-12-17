import { timeout } from 'rxjs';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../db/prisma.service';

@Processor('payroll-recalculation')
export class RecalculatedPayrollTeacherProcessor {
  private readonly logger = new Logger(
    RecalculatedPayrollTeacherProcessor.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  private roundMoney(amount: Prisma.Decimal): Prisma.Decimal {
    return new Prisma.Decimal(amount.toFixed(0));
  }

  /**
   * Worker nhận lệnh tính lại lương
   */
  @Process('recalculate')
  async handleRecalculation(job: Job<{ payrollId: string }>) {
    const { payrollId } = job.data;
    this.logger.log(`Bắt đầu job tính lại Payroll ID: ${payrollId}`);

    try {
      const idBig = BigInt(payrollId);

      // 1. Kiểm tra Payroll hợp lệ
      const oldPayroll = await this.prisma.payroll.findUnique({
        where: { id: idBig },
        include: { teacher: true },
      });

      if (!oldPayroll) {
        this.logger.error(`Payroll ${payrollId} không tồn tại`);
        return;
      }

      // Chỉ tính lại nếu đang pending hoặc rejected
      if (!['pending', 'rejected_by_teacher'].includes(oldPayroll.status)) {
        this.logger.warn(
          `Payroll ${payrollId} trạng thái ${oldPayroll.status} không được phép tính lại.`,
        );
        return;
      }

      const { teacherId, periodStart, periodEnd } = oldPayroll;

      // --- THIẾT LẬP THỜI GIAN (ĐỒNG BỘ VỚI CRON) ---
      const year = periodStart.getFullYear();
      const month = periodStart.getMonth();

      // Kỳ Học (studyMonth)
      const studyMonthStart = new Date(Date.UTC(year, month, 1));
      const studyMonthEnd = new Date(Date.UTC(year, month + 1));

      // Kỳ Hóa Đơn (billingMonth)

      // Chốt sổ tháng này (ngày 8)
      const closingDate = new Date(Date.UTC(year, month + 1, 8));

      // Chốt sổ tháng trước (ngày 8)
      const previousClosingDate = new Date(Date.UTC(year, month, 8));

      // --- OPTIMIZATION: PRE-FETCH CONTRACTS ---
      const allContracts = await this.prisma.contractUpload.findMany({
        where: { teacherId, status: 'active' },
        orderBy: { uploadedAt: 'desc' },
        select: {
          startDate: true,
          expiredAt: true,
          teacherSalaryPercent: true,
        },
      });

      const findRateInMemory = (date: Date): Prisma.Decimal => {
        const match = allContracts.find((c) => {
          const startOk = !c.startDate || c.startDate <= date;
          const endOk = !c.expiredAt || c.expiredAt >= date;
          return startOk && endOk;
        });
        if (!match || !match.teacherSalaryPercent) return new Prisma.Decimal(0);
        let rate = new Prisma.Decimal(match.teacherSalaryPercent);
        if (rate.gt(1)) rate = rate.dividedBy(100);
        return rate;
      };

      // === BẮT ĐẦU TRANSACTION ===
      await this.prisma.$transaction(async (tx) => {
        // A. XÓA DỮ LIỆU CŨ
        await tx.teacherSessionPayout.deleteMany({
          where: { payrollId: idBig },
        });
        await tx.payroll.delete({ where: { id: idBig } });

        // B. TÍNH LƯƠNG THÁNG (POOL-BASED)
        const sessions = await tx.classSession.findMany({
          where: {
            sessionDate: { gte: studyMonthStart, lt: studyMonthEnd },
            status: 'end',
            OR: [{ teacherId }, { substituteTeacherId: teacherId }],
          },
          include: {
            class: {
              select: {
                id: true,
                feeAmount: true,
                feeStructure: { select: { amount: true } },
              },
            },
          },
        });

        let currentMonthSalary = new Prisma.Decimal(0);
        const newPayoutIds: bigint[] = [];

        // Group session theo lớp
        const sessionsByClass = new Map<string, typeof sessions>();
        for (const s of sessions) {
          const list = sessionsByClass.get(s.classId) || [];
          list.push(s);
          sessionsByClass.set(s.classId, list);
        }

        for (const [classId, classSessions] of sessionsByClass) {
          const cls = classSessions[0].class;
          const realSessionFee =
            cls.feeAmount || cls.feeStructure?.amount || new Prisma.Decimal(0);

          const feeRecords = await tx.feeRecord.findMany({
            where: {
              classId: classId,
              dueDate: { gt: previousClosingDate, lt: closingDate },
              status: 'paid',
              feeRecordPayments: {
                some: { payment: { paidAt: { lt: closingDate } } },
              },
            },
            select: { id: true, totalAmount: true, amount: true },
          });
          const totalRevenue = feeRecords.reduce(
            (sum, r) => sum.plus(r.totalAmount || r.amount),
            new Prisma.Decimal(0),
          );
          const totalClassSessions = await tx.classSession.count({
            where: {
              classId,
              sessionDate: { gte: studyMonthStart, lt: studyMonthEnd },
              status: 'end',
            },
          });

          if (totalRevenue.isZero() || totalClassSessions === 0) continue;
          const rawValuePerSession =
            this.roundMoney(totalRevenue).dividedBy(totalClassSessions);

          for (const session of classSessions) {
            const newRate = findRateInMemory(session.sessionDate);
            const teacherPayout = this.roundMoney(
              rawValuePerSession.times(newRate),
            );

            const attendanceCount = await tx.studentSessionAttendance.count({
              where: { sessionId: session.id, status: { not: 'excused' } },
            });

            const tsp = await tx.teacherSessionPayout.create({
              data: {
                sessionId: session.id,
                teacherId: teacherId,
                status: 'batched',
                studentCount: attendanceCount,
                sessionFeePerStudent: realSessionFee,
                totalRevenue: rawValuePerSession,
                payoutRate: newRate,
                teacherPayout: teacherPayout,
              },
            });
            newPayoutIds.push(tsp.id);
            currentMonthSalary = currentMonthSalary.plus(teacherPayout);
          }
        }

        // C. TÍNH TRUY LĨNH (WINNER TAKES ALL)
        let backPayTotal = new Prisma.Decimal(0);
        const backPayDetails: any[] = [];

        const latePayments = await tx.feeRecordPayment.findMany({
          where: {
            payment: { paidAt: { gte: previousClosingDate, lt: closingDate } },
            feeRecord: {
              dueDate: { lt: previousClosingDate },
              status: 'paid',
              class: { teacherId: teacherId },
            },
          },
          include: {
            feeRecord: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
                class: true,
              },
            },
            payment: true,
          },
        });

        const allHistoryPayouts = await tx.teacherSessionPayout.findMany({
          where: {
            teacherId: teacherId,
          },
          select: {
            payoutRate: true,
            session: {
              select: {
                classId: true,
                sessionDate: true,
              },
            },
          },
        });

        const payoutRateCache = new Map<string, Prisma.Decimal>();
        for (const hp of allHistoryPayouts) {
          const sessionDate = hp.session.sessionDate;
          const key = `${hp.session.classId}_${sessionDate.getFullYear()}_${sessionDate.getMonth()}`;
          if (!payoutRateCache.has(key)) {
            payoutRateCache.set(key, hp.payoutRate);
          }
        }

        for (const p of latePayments) {
          const feeRecord = p.feeRecord;
          if (!feeRecord || !feeRecord.classId) continue;

          const paymentAmount = feeRecord.totalAmount || feeRecord.amount;
          const studentName = feeRecord.student?.user?.fullName || 'HS';
          const className = feeRecord.class?.name || 'Lớp';

          // Xác định tháng của hóa đơn nợ
          const debtDate = feeRecord.dueDate;
          const dY = debtDate.getFullYear();
          const dM = debtDate.getMonth();
          const debtMonthStart = new Date(Date.UTC(dY, dM, 1));
          const debtMonthEnd = new Date(Date.UTC(dY, dM + 1, 1));

          // Tìm lịch sử Payout của GV này tại thời điểm nợ
          let finalRate: Prisma.Decimal;
          const cacheKey = `${feeRecord.classId}_${dY}_${dM}`;
          const cachedRate = payoutRateCache.get(cacheKey);

          if (cachedRate) {
            finalRate = cachedRate;
          } else {
            finalRate = findRateInMemory(debtDate);
            this.logger.warn(
              `Không tìm thấy lịch sử bảng lương tháng ${dM + 1}/${dY} cho GV ${teacherId}. Dùng tỷ lệ theo hợp đồng.`,
            );
          }

          if (finalRate.isZero()) continue;

          const payout = this.roundMoney(paymentAmount.times(finalRate));
          backPayTotal = backPayTotal.plus(payout);

          backPayDetails.push({
            feeRecordId: feeRecord.id,
            sessionId: 'BACKPAY',
            sessionDate: p.payment.paidAt.toISOString().slice(0, 10),
            description: `Lương cũ T${dM + 1}: ${className} (${studentName}) - tỷ lệ áp dụng: ${finalRate.times(100)}%`,
            revenuePerSession: paymentAmount.toNumber(),
            payoutRate: finalRate.toNumber(),
            payoutAmount: payout.toNumber(),
          });
        }

        // D. TẠO PAYROLL MỚI
        const totalAmount = currentMonthSalary.plus(backPayTotal);
        const metadata = {
          totalSessions: newPayoutIds.length,
          totalSessionPayouts: currentMonthSalary.toFixed(0),
          backPayCount: backPayDetails.length,
          backPayTotal: backPayTotal.toFixed(0),
          processedAt: new Date().toISOString(),
          note: 'Lương Quỹ Lớp + Lương từ buổi học cũ (Tính lại)',
        };

        const newPayroll = await tx.payroll.create({
          data: {
            teacherId,
            periodStart,
            periodEnd,
            totalAmount,
            backPayAmount: backPayTotal,
            bonuses: 0,
            computedDetails: { metadata, backPayDetails } as any,
            status: 'pending', // Reset về pending
          },
        });

        if (newPayoutIds.length > 0) {
          await tx.teacherSessionPayout.updateMany({
            where: { id: { in: newPayoutIds } },
            data: { payrollId: newPayroll.id },
          });
        }
      }, {
        timeout: 60000, // 60 giây
        maxWait: 20000, // 20 giây
      });

      this.logger.log(`Đã tính lại xong Payroll cho GV ${teacherId}`);
    } catch (error) {
      this.logger.error(`Lỗi tính lại Payroll ${payrollId}:`, error);
      throw error; // Throw để BullMQ biết job fail và có thể retry
    }
  }
}
