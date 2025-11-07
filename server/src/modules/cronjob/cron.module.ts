import { Module } from '@nestjs/common';
import { BillCronService } from './service/bill-cron.service';
import { PayrollCronService } from './service/payroll-teacher.service';
import { PrismaService } from '../../db/prisma.service';

@Module({
  providers: [BillCronService, PayrollCronService, PrismaService],
})
export class TasksModule {}