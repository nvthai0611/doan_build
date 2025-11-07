// src/payroll/payroll.cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PayrollCronService {
  private readonly logger = new Logger(PayrollCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job này chạy vào 1:00 sáng mỗi ngày.
   * Mục đích: Tìm tất cả các ClassSession đã kết thúc (status = 'end')
   * của ngày hôm trước MÀ CHƯA CÓ TeacherSessionPayout
   * và tính toán, tạo record payout cho giáo viên.
   */
  // CronExpression.EVERY_DAY_AT_1AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'calculateDailyTeacherPayouts',
    timeZone: 'Asia/Ho_Chi_Minh', // Đặt múi giờ Việt Nam
  })
  async handleCalculateDailyPayouts() {
    const jobStartTime = new Date();
    this.logger.log(
      'Starting daily teacher payout calculation job...',
      'calculateDailyTeacherPayouts',
    );

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // 1. Lấy ngày hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm qua

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay

    let sessionsToProcess = [];

    try {
      // 2. Tìm các session đủ điều kiện
      sessionsToProcess = await this.prisma.classSession.findMany({
        where: {
          sessionDate: {
            gte: yesterday, // Lớn hơn hoặc bằng 00:00:00 hôm qua
            lt: today,      // Nhỏ hơn 00:00:00 hôm nay
          },
          status: 'end', // Chỉ xử lý các buổi đã kết thúc
          teacherSessionPayout: null, // CHƯA được tính (quan trọng)
        },
        include: {
          class: {
            select: {
              // Giả định feeAmount trên Class là phí/buổi/học sinh
              // Nếu logic phức tạp hơn, bạn cần lấy từ FeeStructure
              feeAmount: true,
            },
          },
        },
      });

      if (sessionsToProcess.length === 0) {
        this.logger.log(
          'No sessions found to process for yesterday.',
          'calculateDailyTeacherPayouts',
        );
      }

      // 3. Lặp qua từng session để xử lý
      for (const session of sessionsToProcess) {
        try {
          // 3.1. Xác định giáo viên (Ưu tiên giáo viên dạy thay)
          const teacherId = session.substituteTeacherId || session.teacherId;

          if (!teacherId) {
            throw new Error(
              `Session ${session.id} has no teacher or substitute teacher assigned.`,
            );
          }

          // 3.2. Đếm số học sinh có tham dự
          const studentCount = await this.prisma.studentSessionAttendance.count({
            where: {
              sessionId: session.id,
              // === GIẢ ĐỊNH BUSINESS LOGIC ===
              // Giả định 'PRESENT' là trạng thái học sinh có đi học và được tính phí
              status: {
                not: 'excused'
              },
            },
          });

          // 3.3. Lấy thông tin phí và tỉ lệ payout
          // === GIẢ ĐỊNH BUSINESS LOGIC ===
          // Giả định `feeAmount` trên `Class` là phí/buổi/học sinh.
          // Nếu không phải, bạn cần query `FeeStructure` liên quan đến `Class`.
          const sessionFeePerStudent =
            session.class.feeAmount || new Prisma.Decimal(0);

          // === GIẢ ĐỊNH BUSINESS LOGIC ===
          // Tỉ lệ trả cho giáo viên (ví dụ: 40%).
          // Bạn NÊN lấy tỉ lệ này từ `Contract` hoặc `Teacher` thay vì hardcode.
          const payoutRate = new Prisma.Decimal(0.4); // 40%

          // 3.4. Tính toán
          const totalRevenue = sessionFeePerStudent.mul(studentCount);
          const teacherPayout = totalRevenue.mul(payoutRate);

          // 3.5. Tạo record Payout
          await this.prisma.teacherSessionPayout.create({
            data: {
              sessionId: session.id,
              teacherId: teacherId,
              payrollId: null, // Sẽ được cập nhật khi gộp vào bảng lương
              sessionFeePerStudent: sessionFeePerStudent,
              studentCount: studentCount,
              totalRevenue: totalRevenue,
              payoutRate: payoutRate,
              teacherPayout: teacherPayout,
              calculatedAt: new Date(),
              status: 'calculated', // Trạng thái: Đã tính, chờ gộp
            },
          });

          successCount++;
        } catch (error) {
          failedCount++;
          const errorMessage = `Failed to process session ${session.id}: ${error.message}`;
          this.logger.error(errorMessage, error.stack, 'calculateDailyTeacherPayouts');
          errors.push({
            itemId: session.id,
            itemName: `Session ${session.id}`,
            error: error.message,
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Critical error during job execution: ${error.message}`,
        error.stack,
        'calculateDailyTeacherPayouts',
      );
      // Ghi lại lỗi nghiêm trọng vào CronJobExecution
      await this.prisma.cronJobExecution.create({
        data: {
          jobType: 'daily_teacher_payout',
          status: 'failed',
          startedAt: jobStartTime,
          completedAt: new Date(),
          totalItems: sessionsToProcess.length,
          errorMessage: `Job failed to start or query: ${error.message}`,
          durationMs: new Date().getTime() - jobStartTime.getTime(),
        },
      });
      return; // Dừng thực thi
    }

    // 4. Ghi lại kết quả thực thi job vào bảng CronJobExecution
    const jobDuration = new Date().getTime() - jobStartTime.getTime();
    const jobStatus =
      failedCount > 0
        ? sessionsToProcess.length === failedCount
          ? 'failed' // Thất bại hoàn toàn
          : 'completed_with_errors' // Hoàn thành nhưng có lỗi
        : 'success'; // Thành công

    await this.prisma.cronJobExecution.create({
      data: {
        jobType: 'daily_teacher_payout',
        status: jobStatus,
        startedAt: jobStartTime,
        completedAt: new Date(),
        totalItems: sessionsToProcess.length,
        successCount: successCount,
        failedCount: failedCount,
        errorMessage:
          failedCount > 0
            ? `${failedCount}/${sessionsToProcess.length} sessions failed to process.`
            : null,
        errorDetails: errors.length > 0 ? errors : Prisma.JsonNull,
        durationMs: jobDuration,
      },
    });

    this.logger.log(
      `Finished daily payout calculation job. Total: ${sessionsToProcess.length}, Success: ${successCount}, Failed: ${failedCount}. Duration: ${jobDuration}ms`,
      'calculateDailyTeacherPayouts',
    );
  }


  @Cron('0 2 7 * *', { // 02:00, ngày 7 hàng tháng
    name: 'generateMonthlyTeacherPayrolls',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleGenerateMonthlyPayrolls() {
    const jobStartTime = new Date();
    this.logger.log(
      'Starting monthly payroll generation job...',
      'generateMonthlyTeacherPayrolls',
    );

    // 1. Khởi tạo biến báo cáo
    let successCount = 0; // Số lượng giáo viên được xử lý thành công
    let failedCount = 0;
    let totalTeachers = 0;
    const errors = [];

    // 2. Xác định kỳ lương (Tháng trước)
    // Ví dụ: Job chạy ngày 7/12, kỳ lương sẽ là 1/11 -> 30/11
    const today = new Date();
    
    // Lấy ngày cuối cùng của tháng trước (ngày 0 của tháng hiện tại)
    const periodEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    periodEnd.setHours(23, 59, 59, 999); // 23:59:59 ngày cuối tháng

    // Lấy ngày đầu tiên của tháng trước
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    periodStart.setHours(0, 0, 0, 0); // 00:00:00 ngày đầu tháng

    this.logger.log(
      `Processing payroll for period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`,
      'generateMonthlyTeacherPayrolls',
    );

    let teacherIdsToProcess = [];

    try {
      // 3. Tìm tất cả giáo viên có payout 'calculated' trong kỳ
      const distinctPayouts = await this.prisma.teacherSessionPayout.findMany({
        where: {
          status: 'calculated', // Chỉ lấy các buổi đã tính, chưa gộp
          session: {
            sessionDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
        select: {
          teacherId: true,
        },
        distinct: ['teacherId'],
      });

      teacherIdsToProcess = distinctPayouts.map((p) => p.teacherId);
      totalTeachers = teacherIdsToProcess.length;

      if (totalTeachers === 0) {
        this.logger.log(
          'No teachers with calculated payouts found for this period.',
          'generateMonthlyTeacherPayrolls',
        );
      }

      // 4. Lặp qua từng giáo viên để tạo bảng lương
      for (const teacherId of teacherIdsToProcess) {
        try {
          // Lấy TẤT CẢ payout 'calculated' của giáo viên này trong kỳ
          const payoutsToBatch = await this.prisma.teacherSessionPayout.findMany({
              where: {
                teacherId: teacherId,
                status: 'calculated',
                session: {
                  sessionDate: {
                    gte: periodStart,
                    lte: periodEnd,
                  },
                },
              },
            });

          if (payoutsToBatch.length === 0) {
            continue; // Bỏ qua nếu không có gì để xử lý
          }

          // Tính tổng số tiền
          const totalAmount = payoutsToBatch.reduce(
            (sum, p) => sum.add(p.teacherPayout),
            new Prisma.Decimal(0),
          );

          const payoutIdsAsBigInt = payoutsToBatch.map((p) => p.id); // bigint[]
          const payoutIdsAsString = payoutIdsAsBigInt.map((id) => id.toString()); // string[]

          // 5. Gộp vào transaction:
          // 1. TẠO 'Payroll'
          // 2. CẬP NHẬT 'TeacherSessionPayout'
          await this.prisma.$transaction(async (tx) => {
            // 1. Tạo bảng lương tổng
            const newPayroll = await tx.payroll.create({
              data: {
                teacherId: teacherId,
                periodStart: periodStart,
                periodEnd: periodEnd,
                totalAmount: totalAmount,
                status: 'pending', // Trạng thái: "Chờ Kế toán kiểm tra"
                computedDetails: {
                  sessionCount: payoutsToBatch.length,
                  payoutIds: payoutIdsAsString, // Lưu lại ID các session đã gộp
                  generatedAt: jobStartTime.toISOString(),
                },
                // Các trường bonuses, deductions sẽ dùng giá trị default
              },
            });

            // 2. Cập nhật trạng thái các payout lẻ
            await tx.teacherSessionPayout.updateMany({
              where: {
                id: {
                  in: payoutIdsAsBigInt,
                },
              },
              data: {
                status: 'batched', // Trạng thái: "Đã gộp vào Payroll"
                payrollId: newPayroll.id, // Liên kết tới bảng lương tổng
              },
            });
          });

          successCount++;
        } catch (error) {
          failedCount++;
          const errorMessage = `Failed to process payroll for teacher ${teacherId}: ${error.message}`;
          this.logger.error(
            errorMessage,
            error.stack,
            'generateMonthlyTeacherPayrolls',
          );
          errors.push({
            itemId: teacherId,
            itemName: `Teacher ${teacherId}`,
            error: error.message,
          });
        }
      } // Kết thúc vòng lặp
    } catch (error) {
      // Lỗi nghiêm trọng (query hỏng, mất kết nối DB, v.v.)
      this.logger.error(
        `Critical error during monthly payroll job: ${error.message}`,
        error.stack,
        'generateMonthlyTeacherPayrolls',
      );
      await this.prisma.cronJobExecution.create({
        data: {
          jobType: 'monthly_payroll_generation',
          status: 'failed',
          startedAt: jobStartTime,
          completedAt: new Date(),
          totalItems: teacherIdsToProcess.length,
          errorMessage: `Job failed during query or setup: ${error.message}`,
          durationMs: new Date().getTime() - jobStartTime.getTime(),
        },
      });
      return; // Dừng thực thi
    }

    // 6. Ghi log báo cáo tóm tắt
    const jobDuration = new Date().getTime() - jobStartTime.getTime();
    const jobStatus =
      failedCount > 0
        ? totalTeachers === failedCount
          ? 'failed' // Thất bại hoàn toàn
          : 'completed_with_errors' // Hoàn thành nhưng có lỗi
        : 'success'; // Thành công

    await this.prisma.cronJobExecution.create({
      data: {
        jobType: 'monthly_payroll_generation',
        status: jobStatus,
        startedAt: jobStartTime,
        completedAt: new Date(),
        totalItems: totalTeachers, // Tổng số giáo viên tìm thấy
        successCount: successCount, // Số giáo viên được tạo lương thành công
        failedCount: failedCount,
        errorMessage:
          failedCount > 0
            ? `${failedCount}/${totalTeachers} teacher payrolls failed to generate.`
            : null,
        errorDetails: errors.length > 0 ? errors : Prisma.JsonNull,
        durationMs: jobDuration,
        metadata: {
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
        }
      },
    });

    this.logger.log(
      `Finished monthly payroll job. Total Teachers: ${totalTeachers}, Success: ${successCount}, Failed: ${failedCount}. Duration: ${jobDuration}ms`,
      'generateMonthlyTeacherPayrolls',
    );
  }
}