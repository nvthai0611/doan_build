import { Module } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { AttendanceController } from './controllers/attendance.controller';
import { ClassManagementController } from './controllers/class-management.controller';
import { CommunicationController } from './controllers/communication.controller';
import { GradeController } from './controllers/grade.controller';
import { LeaveRequestController } from './controllers/leave-request.controller';
import { MaterialController } from './controllers/material.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { StudentManagementController } from './controllers/student-management.controller';
import { AttendanceService } from './services/attendance.service';
import { ClassManagementService } from './services/class-management.service';
import { CommunicationService } from './services/communication.service';
import { GradeService } from './services/grade.service';
import { LeaveRequestService } from './services/leave-request.service';
import { MaterialService } from './services/material.service';
import { ReportService } from './services/report.service';
import { ScheduleService } from './services/schedule.service';
import { StudentManagementService } from './services/student-management.service';

@Module({
  imports: [],
  controllers: [
    AttendanceController,
    ClassManagementController,
    CommunicationController,
    GradeController,
    LeaveRequestController,
    MaterialController,
    ScheduleController,
    StudentManagementController,
  ],
  providers: [
    PrismaService,
    AttendanceService,
    ClassManagementService,
    CommunicationService,
    GradeService,
    LeaveRequestService,
    MaterialService,
    ReportService,
    ScheduleService,
    StudentManagementService,
  ],
})
export class TeacherModule {}
