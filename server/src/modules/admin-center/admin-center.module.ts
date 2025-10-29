import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApprovalManagementController } from './controllers/approval-management.controller';
import { ClassManagementController } from './controllers/class-management.controller';
import { EnrollmentManagementController } from './controllers/enrollment-management.controller';
import { FinancialManagementController } from './controllers/financial-management.controller';
import { LeaveRequestsController } from './controllers/leave-requests.controller';
import { SessionRequestsController } from './controllers/session-requests.controller';
import { ScheduleManagementController } from './controllers/schedule-management.controller';
import { TeacherManagementController } from './controllers/teacher-management.controller';
import { UsersController } from './controllers/user-management.controller';
import { ApprovalManagementService } from './services/approval-management.service';
import { ClassManagementService } from './services/class-management.service';
import { EnrollmentManagementService } from './services/enrollment-management.service';
import { FinancialManagementService } from './services/financial-management.service';
import { LeaveRequestsService } from './services/leave-requests.service';
import { SessionRequestsService } from './services/session-requests.service';
import { ScheduleManagementService } from './services/schedule-management.service';
import { TeacherManagementService } from './services/teacher-management.service';
import { UsersService } from './services/user-management.service';
import { PrismaService } from 'src/db/prisma.service';
import { RouterModule } from '@nestjs/core';
import { StudentManagementController } from './controllers/student-management.controller';
import { StudentManagementService } from './services/student-management.service';
import { IncidentHandleController } from './controllers/incident-handle.controller';
import { IncidentHandleService } from './services/incident-handle.service';
import { ParentManagementController } from './controllers/parent-management.controller';
import { ParentManagementService } from './services/parent-management.service';
import { SharedModule } from '../shared/shared.module';
import { SettingsManagementController } from './controllers/settings-management.controller';
import { SettingsManagementService } from './services/settings-management.service';
import { HolidaysSettingController } from './controllers/holidays-setting.controller';
import { HolidaysSettingService } from './services/holidays-setting.service';
import { FileManagementController } from './controllers/file-management.controller';
import { FileManagementService } from './services/file-management.service';
import { AlertController } from './controllers/alert.controller';
import { AlertService } from './services/alert.service';
import { MiddlewareCenterOwner } from 'src/common/middleware/center-owner/center-owner.middleware';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SessionSchedulerService } from './crons/session-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron jobs
    RouterModule.register([
      {
        path: "admin-center", 
        module: AdminCenterModule,
      },
    ]),
    
    SharedModule, //sử dụng email services
  ],
  controllers: [
    ApprovalManagementController,
    ClassManagementController,
    EnrollmentManagementController,
    FinancialManagementController,
    LeaveRequestsController,
    SessionRequestsController,
    ScheduleManagementController,
    TeacherManagementController,
    UsersController,
    StudentManagementController,
    IncidentHandleController,
    ParentManagementController,
    SettingsManagementController,
    HolidaysSettingController,
    FileManagementController,
    AlertController,
  ],
  providers: [
    PrismaService,
    ApprovalManagementService,
    ClassManagementService,
    EnrollmentManagementService,
    FinancialManagementService,
    LeaveRequestsService,
    SessionRequestsService,
    ScheduleManagementService,
    TeacherManagementService,
    UsersService,
    StudentManagementService,
    IncidentHandleService,
    ParentManagementService,
    SettingsManagementService,
    HolidaysSettingService,
    FileManagementService,
    AlertService,
    CloudinaryService,
    // SessionSchedulerService, // Cron jobs service
  ],
  exports: [AlertService], // Export để dùng ở module khác

})
//check
export class AdminCenterModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiddlewareCenterOwner)
      .forRoutes(
        { path: 'admin-center/*', method: RequestMethod.ALL }
      );
  }
}
