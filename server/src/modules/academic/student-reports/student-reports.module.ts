import { Module } from '@nestjs/common';
import { StudentReportsController } from './student-reports.controller';
import { StudentReportsService } from './student-reports.service';

@Module({
  controllers: [StudentReportsController],
  providers: [StudentReportsService]
})
export class StudentReportsModule {}
