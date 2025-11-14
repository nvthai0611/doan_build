import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../db/prisma.service';
import { EmailServiceNotificationBill } from '../../shared/services/email-notification-bill.service';

@Injectable()
export class FeeReminderService {
  private readonly logger = new Logger(FeeReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailServiceNotificationBill, // Assume emailService is properly defined elsewhere
  ) {}

  /**
   * Cronjob: Gửi email nhắc nhở sớm vào ngày 3 hàng tháng lúc 8:00 AM
   */
  @Cron('0 8 3 * *', {
    name: 'early-fee-reminder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleEarlyFeeReminder() {
    this.logger.log('🔔 Running early fee reminder job...');
    await this.processFeeReminders('early');
  }

  /**
   * Cronjob: Gửi email nhắc hạn cuối vào ngày 7 hàng tháng lúc 8:00 AM
   */
  @Cron('0 8 7 * *', {
    name: 'due-fee-reminder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDueFeeReminder() {
    this.logger.log('🔔 Running due date fee reminder job...');
    await this.processFeeReminders('due');
  }

  /**
   * Xử lý logic gửi email nhắc nhở
   */
  private async processFeeReminders(type: 'early' | 'due') {
    const executionId = await this.createJobExecution(type);

    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Lấy tất cả hóa đơn pending/overdue trong tháng hiện tại
      const feeRecords = await this.prisma.feeRecord.findMany({
        where: {
          status: {
            in: ['pending','processing', 'overdue'],
          },
          dueDate: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lte: new Date(currentYear, currentMonth, 0),
          },
        },
        include: {
          student: {
            include: {
              user: true,
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
              grade: true,
            },
          },
          feeStructure: true,
        },
      });

      this.logger.log(`📊 Found ${feeRecords.length} fee records to process`);

      let successCount = 0;
      let failedCount = 0;
      const errorDetails: any[] = [];

      // Nhóm hóa đơn theo phụ huynh
      const feesByParent = this.groupFeesByParent(feeRecords);

      for (const [parentId, fees] of Object.entries(feesByParent)) {
        try {
          const parent = fees[0].student.parent;
          if (!parent?.user?.email) {
            throw new Error('Parent email not found');
          }

          // Gửi email
          await this.emailService.sendFeeReminderEmail({
            type,
            parentEmail: parent.user.email,
            parentName: parent.user.fullName || 'Quý phụ huynh',
            feeRecords: fees,
            dueDate: fees[0].dueDate,
          });

          // Tạo notification trong hệ thống
        //   await this.prisma.notification.create({
        //     title:
        //       type === 'early'
        //         ? '🔔 Nhắc nhở đóng học phí'
        //         : '⚠️ Hạn đóng học phí hôm nay',
        //     body: `Bạn có ${fees.length} hóa đơn cần thanh toán. Tổng: ${this.formatCurrency(
        //       fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0),
        //     )}`,
        //     audience: {
        //       userIds: [parent.userId],
        //     },
        //     type: 'fee_reminder',
        //     createdBy: 'system',
        //   });

          successCount++;
        } catch (error: any) {
          failedCount++;
          errorDetails.push({
            itemId: parentId,
            itemName: fees[0].student.parent?.user?.fullName || 'Unknown',
            error: error.message,
          });
          this.logger.error(
            `❌ Failed to send reminder to parent ${parentId}:`,
            error.stack,
          );
        }
      }

      // Cập nhật kết quả
      await this.updateJobExecution(executionId, {
        status: 'success',
        totalItems: Object.keys(feesByParent).length,
        successCount,
        failedCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : null,
      });

      this.logger.log(
        `✅ Job completed: ${successCount} success, ${failedCount} failed`,
      );
    } catch (error: any) {
      this.logger.error('❌ Job failed:', error.stack);
      await this.updateJobExecution(executionId, {
        status: 'failed',
        errorMessage: error.message,
      });
    }
  }

  /**
   * Nhóm hóa đơn theo phụ huynh
   */
  private groupFeesByParent(feeRecords: any[]) {
    const grouped: Record<string, any[]> = {};

    for (const fee of feeRecords) {
      const parentId = fee.student.parentId;
      if (!parentId) continue;

      if (!grouped[parentId]) {
        grouped[parentId] = [];
      }
      grouped[parentId].push(fee);
    }

    return grouped;
  }

  /**
   * Tạo bản ghi tracking job
   */
  private async createJobExecution(type: 'early' | 'due') {
    const job = await this.prisma.cronJobExecution.create({
      data: {
        jobType: `fee_reminder_${type}`,
        status: 'running',
        metadata: {
          reminderType: type,
          executedAt: new Date().toISOString(),
        },
      },
    });
    return job.id;
  }

  /**
   * Cập nhật kết quả job
   */
  private async updateJobExecution(
    id: string,
    data: {
      status: string;
      totalItems?: number;
      successCount?: number;
      failedCount?: number;
      errorDetails?: any;
      errorMessage?: string;
    },
  ) {
    const completedAt =
      data.status === 'success' || data.status === 'failed'
        ? new Date()
        : undefined;

    const startedAt = await this.prisma.cronJobExecution
      .findUnique({ where: { id }, select: { startedAt: true } })
      .then((j) => j?.startedAt);

    const durationMs =
      completedAt && startedAt
        ? completedAt.getTime() - startedAt.getTime()
        : undefined;

    await this.prisma.cronJobExecution.update({
      where: { id },
      data: {
        ...data,
        completedAt,
        durationMs,
      },
    });
  }

  /**
   * Format số tiền VND
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}