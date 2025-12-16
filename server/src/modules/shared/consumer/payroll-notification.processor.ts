import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { EmailNotificationPayrollService } from '../services/email-notification-payroll.service';

interface PayrollNotificationPayload {
  payrollId: bigint;
  executionId?: string; // ID của CronJobExecution
}

@Processor('payroll-notification')
export class PayrollNotificationProcessor {
  private readonly logger = new Logger(PayrollNotificationProcessor.name);

  constructor(
    private readonly emailService: EmailNotificationPayrollService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('send-payroll-notification')
  async handlePayrollNotification(job: Job<PayrollNotificationPayload>) {
    const { payrollId, executionId } = job.data;
    const errorDetails: any[] = [];

    try {
      // Lấy thông tin payroll
      const payroll = await this.prisma.payroll.findUnique({
        where: { id: payrollId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!payroll || !payroll.teacher.user.email) {
        throw new Error('Payroll or teacher email not found');
      }

      // Format thông tin lương
      const payrollInfo = {
        period: `${payroll.periodStart.toLocaleDateString('vi-VN')} - ${payroll.periodEnd.toLocaleDateString('vi-VN')}`,
        totalAmount: payroll.totalAmount.toString(),
        bonuses: payroll.bonuses.toString(),
        deductions: payroll.deductions.toString(),
        status: payroll.status,
      };

      // Gửi email
      await this.emailService.sendPayrollNotificationEmail({
        teacherName: payroll.teacher.user.fullName || 'Giáo viên',
        teacherEmail: payroll.teacher.user.email,
        payrollInfo,
        payrollId: payroll.id.toString(),
      });
      console.log("Cập nhật payroll");
      
      // ✅ Cập nhật status payroll thành "notified"
      await this.prisma.payroll.update({
        where: { id: payrollId },
        data: {
          status: 'waiting_teacher_approval',
          adminPublishedAt: new Date(),
        },
      });

      // ✅ Cập nhật CronJobExecution nếu có executionId
      if (executionId) {
        await this.prisma.cronJobExecution.update({
          where: { id: executionId },
          data: {
            successCount: {
              increment: 1,
            },
          },
        });
      }

      this.logger.log(
        ` Payroll notification sent to ${payroll.teacher.user.email}`,
      );
    } catch (error: any) {
      this.logger.error(' Failed to send payroll notification:', error);

      // ✅ Ghi lại chi tiết lỗi
      errorDetails.push({
        payrollId: payrollId.toString(),
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // ✅ Cập nhật CronJobExecution nếu có executionId
      if (executionId) {
        await this.prisma.cronJobExecution.update({
          where: { id: executionId },
          data: {
            failedCount: {
              increment: 1,
            },
            errorDetails: {
              push: errorDetails[0],
            },
          },
        });
      }

      throw error;
    }
  }
}