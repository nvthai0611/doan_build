import { Module } from '@nestjs/common';
import { BillCronService } from './service/bill-cron.service';

@Module({
  providers: [BillCronService],
})
export class TasksModule {}