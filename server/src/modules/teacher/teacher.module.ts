import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { RouterModule } from '@nestjs/core';
import { MiddlewareTeacher } from '../../common/middleware/teacher/teacher.middleware';
import { CommonController } from './controllers/common.controller';
import { CommonService } from './services/common.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileManagementController } from './controllers/file-management.controller';
import { FileManagementService } from './services/file-management.service';


@Module({
  imports: [RouterModule.register([
    {
      path:'teacher',
      module: TeacherModule
    }
  ])],
  controllers: [
    AttendanceController,
    ClassManagementController,
    CommunicationController,
    GradeController,
    LeaveRequestController,
    MaterialController,
    ScheduleController,
    StudentManagementController,
    CommonController,
    LeaveRequestController,
    FileManagementController,
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
    CommonService,
    LeaveRequestService,
    CloudinaryService,
    FileManagementService,
  ],
})
export class TeacherModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(MiddlewareTeacher).forRoutes('teacher');
  }
}
