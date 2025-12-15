import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../src/db/prisma.service';
import { Prisma } from '@prisma/client';

interface ErrorDetail {
  itemId: string;
  itemName: string;
  error: string;
}

@Injectable()
export class BillCronService {
  private readonly logger = new Logger(BillCronService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Cron chạy vào lúc 00:00 ngày 1 hàng tháng (ví dụ: 00:00 ngày 1/12)
   * Mục đích: Tạo FeeRecord (hóa đơn) cho học sinh dựa trên
   * số buổi học (StudentSessionAttendance) của tháng trước (ví dụ: Tháng 11).
   * TRẠNG THÁI: calculated (chỉ admin thấy, chủ trung tâm có thể review)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT) // "0 0 0 1 * *"
  async handleCreateMonthlyStudentBills() {
    this.logger.log('Bắt đầu chạy Cron Job: Tạo Hóa Đơn Học Sinh Hàng Tháng...');

    const startTime = Date.now();
    const errorDetails: ErrorDetail[] = [];
    let successCount = 0;
    let failedCount = 0;
    let totalItemsProcessed = 0;

    const cronExecutionId = await this.createCronExecution('bill_generation');

    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const firstDayOfLastMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
      const lastDayOfLastMonth = new Date(Date.UTC(currentYear, currentMonth, 0));
      // const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      // const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const dueDate = new Date(Date.UTC(currentYear, currentMonth, 7)); // Hạn thanh toán: ngày 7 của tháng hiện tại
      const billingPeriodStr = `T${firstDayOfLastMonth.getMonth() + 1}/${firstDayOfLastMonth.getFullYear()}`;
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      this.logger.log(
        `Kỳ hóa đơn: ${formatLocalDate(firstDayOfLastMonth)} - ${formatLocalDate(lastDayOfLastMonth)}`,
      );
      this.logger.log(
        `Kỳ hóa đơn: ${firstDayOfLastMonth} - ${lastDayOfLastMonth}`,
      );
      // Lấy danh sách session trong tháng
      this.logger.log('Đang tìm các buổi học trong tháng...');
      const sessionsInMonth = await this.prisma.classSession.findMany({
        where: {
          sessionDate: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
        select: { id: true },
      });
      console.log(firstDayOfLastMonth, lastDayOfLastMonth);

      this.logger.log(`Số buổi trên tháng của lớp: ${sessionsInMonth.length}`);
      if (sessionsInMonth.length === 0) {
        this.logger.log('Không có buổi học nào trong tháng trước. Dừng lại.');
        await this.updateCronExecution(cronExecutionId, {
          status: 'success',
          totalItems: 0,
          successCount: 0,
          failedCount: 0,
          durationMs: Date.now() - startTime,
        });
        return;
      }

      const sessionIds = sessionsInMonth.map((session) => session.id);

      this.logger.log('Đang nhóm điểm danh của học sinh...');
      const attendances = await this.prisma.studentSessionAttendance.findMany({
        where: {
          sessionId: { in: sessionIds },
          status: { not: 'excused' },
        },
        select: {
          studentId: true,
          session: {
            select: {
              classId: true, // ✅ Lấy classId từ relation
            },
          },
        },
      });
      //Group với map để tránh quá nhiều truy vấn 
      const attendanceMap = new Map<string, { studentId: string; classId: string; count: number }>();

      attendances.forEach((attendance) => {
        const classId = attendance.session.classId;
        const key = `${attendance.studentId}_${classId}`;
        const existing = attendanceMap.get(key);

        if (existing) {
          existing.count++;
        } else {
          attendanceMap.set(key, {
            studentId: attendance.studentId,
            classId: classId,
            count: 1,
          });
        }
      });

      // ✅ Convert sang array với format giống groupBy
      const attendanceGroups = Array.from(attendanceMap.values()).map((group) => ({
        studentId: group.studentId,
        classId: group.classId,
        _count: { id: group.count },
      }));

      this.logger.log(`Tìm thấy ${attendanceGroups.length} nhóm để tạo hóa đơn.`);
      totalItemsProcessed = attendanceGroups.length;

      // ✅ NEW: Pre-fetch tất cả scholarship để optimize performance
      const scholarships = await this.prisma.scholarship.findMany({
        where: { isActive: true },
        select: { id: true, percent: true },
      });

      const scholarshipMap = new Map<string, Prisma.Decimal>();
      scholarships.forEach((scholarship) => {
        scholarshipMap.set(scholarship.id, scholarship.percent);
      });

      // Xử lý từng nhóm
      for (const group of attendanceGroups as any[]) {
        try {
          const { studentId, classId, _count } = group;
          const sessionCount = _count.id;

          if (sessionCount === 0) continue;

          // Lấy thông tin lớp
          const classInfo = await this.prisma.class.findUnique({
            where: { id: classId },
            select: {
              feeStructureId: true,
              feeAmount: true,
              feePeriod: true,
              feeStructure: { select: { amount: true, period: true } },
            },
          });

          if (!classInfo || (!classInfo.feeAmount && !classInfo.feeStructure)) {
            failedCount++;
            errorDetails.push({
              itemId: studentId,
              itemName: `Học Sinh ${studentId}`,
              error: 'Thiếu cấu hình học phí',
            });
            continue;
          }

          const period = classInfo.feePeriod || (classInfo.feeStructure?.period ?? null);
          if (period !== 'per_session') {
            this.logger.log(`Bỏ qua: Học sinh ${studentId} - Không thu theo buổi.`);
            continue;
          }

          const sessionFee = classInfo.feeAmount || (classInfo.feeStructure?.amount ?? null);
          if (!sessionFee || sessionFee.isZero()) {
            failedCount++;
            errorDetails.push({
              itemId: studentId,
              itemName: `Học Sinh ${studentId}`,
              error: 'Không có mức học phí cho buổi học',
            });
            continue;
          }

          // ✅ NEW: Lấy thông tin học bổng của học sinh
          const studentInfo = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { scholarshipId: true },
          });

          let scholarshipPercent = new Prisma.Decimal(0);
          if (studentInfo?.scholarshipId) {
            scholarshipPercent = scholarshipMap.get(studentInfo.scholarshipId) || new Prisma.Decimal(0);
          }

          // Tính toán số tiền
          const totalBeforeDiscount = new Prisma.Decimal(sessionCount).times(sessionFee);
          const scholarshipAmount = totalBeforeDiscount.times(scholarshipPercent).dividedBy(100);
          const totalAmount = totalBeforeDiscount.minus(scholarshipAmount);

          // Kiểm tra hóa đơn tồn tại
          const existingFeeRecord = await this.prisma.feeRecord.findFirst({
            where: { studentId, classId, dueDate },
          });

          if (existingFeeRecord) {
            this.logger.log(`Bỏ qua: Học sinh ${studentId} - Hóa đơn đã tồn tại.`);
            continue;
          }

          // ✅ NEW: Tạo hóa đơn với trạng thái 'calculated' và thông tin học bổng
          await this.prisma.feeRecord.create({
            data: {
              studentId,
              classId,
              feeStructureId: classInfo.feeStructureId,
              amount: totalBeforeDiscount,
              totalAmount: totalAmount,
              scholarship: scholarshipPercent.isZero() ? null : scholarshipPercent,
              dueDate,
              status: 'calculated', // ✅ NEW: Admin-only status
              notes: scholarshipAmount.isZero()
                ? `Hóa đơn ${billingPeriodStr} (${sessionCount} buổi).`
                : `Hóa đơn ${billingPeriodStr} (${sessionCount} buổi). Học bổng: ${scholarshipPercent.toFixed(1)}% = ${scholarshipAmount.toFixed(0)} VND.`,
            },
          });

          successCount++;
          this.logger.log(
            `Đã tạo HĐ cho Học sinh ${studentId}: ${totalAmount.toFixed(0)} VND (${sessionCount} buổi, HB: ${scholarshipAmount.toFixed(0)} VND).`,
          );
        } catch (itemError) {
          failedCount++;
          const studentId = group?.studentId || 'Không xác định';
          errorDetails.push({
            itemId: studentId,
            itemName: `Học Sinh ${studentId}`,
            error: itemError instanceof Error ? itemError.message : 'Lỗi không xác định',
          });
          this.logger.error(`Lỗi xử lý học sinh ${studentId}:`, itemError);
        }
      }

      // Cập nhật Cron Execution thành công
      const durationMs = Date.now() - startTime;
      const status = failedCount > 0 ? 'success_with_errors' : 'success';
      const errorMessage =
        failedCount > 0 ? `Không tạo được ${failedCount}/${totalItemsProcessed} hóa đơn` : null;

      await this.updateCronExecution(cronExecutionId, {
        status,
        totalItems: totalItemsProcessed,
        successCount,
        failedCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : null,
        errorMessage,
        durationMs,
      });

      this.logger.log(
        `Hoàn thành Cron Job: ${successCount} thành công, ${failedCount} thất bại.`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error('Cron Job Tạo Hóa Đơn thất bại:', error);

      await this.updateCronExecution(cronExecutionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Lỗi không xác định',
        failedCount: totalItemsProcessed,
        durationMs,
        errorDetails: errorDetails.length > 0 ? errorDetails : null,
      });
    }
  }

  /**
   * ✅ NEW: Cron chạy vào 23:00 ngày 2 hàng tháng
   * Chuyển các hóa đơn từ 'calculated' sang 'pending' 
   * để phụ huynh có thể thấy và thanh toán
   */
  @Cron('0 23 2 * *') // 23:00 ngày 2 hàng tháng
  async handlePublishCalculatedBills() {
    this.logger.log('Bắt đầu chạy Cron Job: Publish Hóa Đơn Calculated...');

    const startTime = Date.now();
    const errorDetails: ErrorDetail[] = [];
    let successCount = 0;
    let failedCount = 0;

    const cronExecutionId = await this.createCronExecution('bill_publishing');

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthDueDate = new Date(now.getFullYear(), now.getMonth(), 7);

      this.logger.log(`Đang tìm hóa đơn calculated với dueDate: ${currentMonthDueDate.toISOString().split('T')[0]}`);

      // Tìm tất cả hóa đơn 'calculated' của tháng hiện tại
      const calculatedBills = await this.prisma.feeRecord.findMany({
        where: {
          status: 'calculated',
          dueDate: currentMonthDueDate,
        },
        select: {
          id: true,
          studentId: true,
          amount: true,
          totalAmount: true,
          scholarship: true,
        },
      });

      if (calculatedBills.length === 0) {
        this.logger.log('Không có hóa đơn calculated nào để publish.');
        await this.updateCronExecution(cronExecutionId, {
          status: 'success',
          totalItems: 0,
          successCount: 0,
          failedCount: 0,
          durationMs: Date.now() - startTime,
        });
        return;
      }

      this.logger.log(`Tìm thấy ${calculatedBills.length} hóa đơn để publish.`);

      // Cập nhật trạng thái hàng loạt
      const billIds = calculatedBills.map((bill) => bill.id);

      const updateResult = await this.prisma.feeRecord.updateMany({
        where: {
          id: { in: billIds },
          status: 'calculated',
        },
        data: {
          status: 'pending',
        },
      });

      successCount = updateResult.count;

      // Log chi tiết
      const totalBillAmount = calculatedBills.reduce(
        (sum, bill) => sum.plus(bill.amount || new Prisma.Decimal(0)),
        new Prisma.Decimal(0),
      );

      const totalScholarshipAmount = calculatedBills.reduce(
        (sum, bill) => sum.plus(bill.scholarship || new Prisma.Decimal(0)),
        new Prisma.Decimal(0),
      );

      const durationMs = Date.now() - startTime;

      await this.updateCronExecution(cronExecutionId, {
        status: 'success',
        totalItems: calculatedBills.length,
        successCount,
        failedCount,
        metadata: {
          publishedBillCount: successCount,
          totalBillAmount: totalBillAmount.toFixed(0),
          totalScholarshipAmount: totalScholarshipAmount.toFixed(0),
          dueDate: currentMonthDueDate.toISOString().split('T')[0],
        },
        durationMs,
      });

      this.logger.log(
        `Hoàn thành Publish Bills: ${successCount} hóa đơn đã chuyển sang 'pending'. Tổng tiền: ${totalBillAmount.toFixed(0)} VND, HB: ${totalScholarshipAmount.toFixed(0)} VND.`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error('Cron Job Publish Bills thất bại:', error);

      await this.updateCronExecution(cronExecutionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        failedCount: 1,
        durationMs,
      });
    }
  }

  /**
   * Cron chạy vào 00:00 ngày 8 hàng tháng
   * Xóa các FeeRecord có totalAmount = 0
   */
  @Cron('0 0 8 * *')
  async handleCleanupZeroAmountBills() {
    this.logger.log('Bắt đầu chạy Cron Job: Xóa Hóa Đơn 0đ...');

    const startTime = Date.now();
    const errorDetails: ErrorDetail[] = [];
    let successCount = 0;
    let failedCount = 0;

    const cronExecutionId = await this.createCronExecution('cleanup_zero_bills');

    try {
      // Tìm các hóa đơn có totalAmount = 0
      const zeroAmountBills = await this.prisma.feeRecord.findMany({
        where: {
          totalAmount: 0,
        },
        select: { id: true, studentId: true },
      });

      if (zeroAmountBills.length === 0) {
        this.logger.log('Không có hóa đơn 0đ nào cần xóa.');
        await this.updateCronExecution(cronExecutionId, {
          status: 'success',
          totalItems: 0,
          successCount: 0,
          failedCount: 0,
          durationMs: Date.now() - startTime,
        });
        return;
      }

      this.logger.log(`Tìm thấy ${zeroAmountBills.length} hóa đơn 0đ để xóa.`);

      try {
        const deleteResult = await this.prisma.feeRecord.deleteMany({
          where: {
            id: { in: zeroAmountBills.map(b => b.id) },
          },
        });

        successCount = deleteResult.count;

      } catch (dbError) {
        failedCount = zeroAmountBills.length;
        errorDetails.push({
          itemId: 'BATCH_DELETE',
          itemName: 'Multiple Bills',
          error: dbError instanceof Error ? dbError.message : 'Database error during batch delete',
        });
        throw dbError;
      }

      await this.updateCronExecution(cronExecutionId, {
        status: 'success',
        totalItems: zeroAmountBills.length,
        successCount,
        failedCount,
        durationMs: Date.now() - startTime,
      });

      this.logger.log(`Hoàn thành Xóa Hóa Đơn 0đ: Đã xóa ${successCount} hóa đơn.`);

    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error('Cron Job Xóa Hóa Đơn 0đ thất bại:', error);

      await this.updateCronExecution(cronExecutionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        failedCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : null,
        durationMs,
      });
    }
  }

  




  private async createCronExecution(jobType: string): Promise<string> {
    const execution = await this.prisma.cronJobExecution.create({
      data: {
        jobType,
        status: 'running',
        totalItems: 0,
        successCount: 0,
        failedCount: 0,
      },
    });
    return execution.id;
  }

  private async updateCronExecution(
    id: string,
    data: {
      status: string;
      totalItems?: number;
      successCount?: number;
      failedCount?: number;
      errorDetails?: ErrorDetail[] | null;
      errorMessage?: string | null;
      durationMs?: number;
      metadata?: Record<string, any>;
    },
  ) {
    const updateData: any = {
      status: data.status,
      totalItems: data.totalItems ?? 0,
      successCount: data.successCount ?? 0,
      failedCount: data.failedCount ?? 0,
      errorMessage: data.errorMessage ?? null,
      durationMs: data.durationMs,
      completedAt: ['success', 'completed_with_errors', 'failed'].includes(data.status)
        ? new Date()
        : undefined,
    };

    if (data.errorDetails !== undefined) {
      updateData.errorDetails = data.errorDetails;
    }

    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    await this.prisma.cronJobExecution.update({
      where: { id },
      data: updateData,
    });
  }
}