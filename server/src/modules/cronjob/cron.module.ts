import { Module } from '@nestjs/common';
import { BillCronService } from './service/bill-cron.service';
import { PayrollCronService } from './service/payroll-teacher.service';
import { ProgressReportCronService } from './service/progress-report-cron.service';
import { CronTestController } from './controllers/cron-test.controller';
import { PrismaService } from '../../db/prisma.service';
import { EmailServiceNotificationBill } from '../shared/services/email-notification-bill.service';

@Module({
  controllers: [CronTestController],
  providers: [BillCronService, PayrollCronService, ProgressReportCronService, PrismaService, EmailServiceNotificationBill ],
})
export class TasksModule {}