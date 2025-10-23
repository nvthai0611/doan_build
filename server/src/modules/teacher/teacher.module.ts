import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AttendanceController } from './controllers/attendance.controller';
import { ClassManagementController } from './controllers/class-management.controller';
import { CommunicationController } from './controllers/communication.controller';
import { GradeController } from './controllers/grade.controller';
import { LeaveRequestController } from './controllers/leave-request.controller';
import { MaterialController } from './controllers/material.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { SessionController } from './controllers/session.controller';
import { StudentManagementController } from './controllers/student-management.controller';
import { AttendanceService } from './services/attendance.service';
import { ClassManagementService } from './services/class-management.service';
import { CommunicationService } from './services/communication.service';
import { GradeService } from './services/grade.service';
import { LeaveRequestService } from './services/leave-request.service';
import { MaterialService } from './services/material.service';
import { ReportService } from './services/report.service';
import { ScheduleService } from './services/schedule.service';
import { SessionService } from './services/session.service';
import { StudentManagementService } from './services/student-management.service';
import { RouterModule } from '@nestjs/core';
import { MiddlewareTeacher } from 'src/common/middleware/teacher/teacher.middleware';
import { CommonController } from './controllers/common.controller';
import { CommonService } from './services/common.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileManagementController } from './controllers/file-management.controller';
import { FileManagementService } from './services/file-management.service';
import { IncidentReportController } from './controllers/incident-report.controller';
import { IncidentReportService } from './services/incident-report.service';
import { TeacherStudentLeaveRequestController } from './controllers/student-leave-request.controller';
import { TeacherStudentLeaveRequestService } from './services/student-leave-request.service';
import { ContractsManageController } from './controllers/contracts-manage.controller';
import { ContractsManageService } from './services/contracts-manage.service';
import { SharedModule } from '../shared/shared.module';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path:'teacher',
        module: TeacherModule
      }
    ]),
    SharedModule, // Import SharedModule để sử dụng EmailNotificationService
  ],
  controllers: [
    AttendanceController,
    ClassManagementController,
    CommunicationController,
    GradeController,
    LeaveRequestController,
    MaterialController,
    ScheduleController,
    SessionController,
    StudentManagementController,
    CommonController,
    LeaveRequestController,
    FileManagementController,
    IncidentReportController,
    ContractsManageController,
    TeacherStudentLeaveRequestController,
  ],
  providers: [
    AttendanceService,
    ClassManagementService,
    CommunicationService,
    GradeService,
    LeaveRequestService,
    MaterialService,
    ReportService,
    ScheduleService,
    SessionService,
    StudentManagementService,
    CommonService,
    LeaveRequestService,
    CloudinaryService,
    FileManagementService,
    IncidentReportService,
    ContractsManageService,
    TeacherStudentLeaveRequestService,
    PrismaService,
  ],
  exports: [
    AttendanceService,
    // ...other exports
  ]
})
export class TeacherModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiddlewareTeacher)
      .forRoutes(
        { path: 'teacher/*', method: RequestMethod.ALL }
      );
  }
}
