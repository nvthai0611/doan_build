import { Module } from '@nestjs/common';
import { ApprovalManagementController } from './controllers/approval-management.controller';
import { ClassManagementController } from './controllers/class-management.controller';
import { EnrollmentManagementController } from './controllers/enrollment-management.controller';
import { FinancialManagementController } from './controllers/financial-management.controller';
import { LeaveRequestsController } from './controllers/leave-requests.controller';
import { ScheduleManagementController } from './controllers/schedule-management.controller';
import { TeacherManagementController } from './controllers/teacher-management.controller';
import { UsersController } from './controllers/user-management.controller';
import { ApprovalManagementService } from './services/approval-management.service';
import { ClassManagementService } from './services/class-management.service';
import { EnrollmentManagementService } from './services/enrollment-management.service';
import { FinancialManagementService } from './services/financial-management.service';
import { LeaveRequestsService } from './services/leave-requests.service';
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

@Module({
  imports: [
    RouterModule.register([
      {
        path: "admin-center", 
        module: AdminCenterModule,
      },
    ]),
    SharedModule, // Import SharedModule để sử dụng email services
  ],
  controllers: [
    ApprovalManagementController,
    ClassManagementController,
    EnrollmentManagementController,
    FinancialManagementController,
    LeaveRequestsController,
    ScheduleManagementController,
    TeacherManagementController,
    UsersController,
    StudentManagementController,
    IncidentHandleController,
    ParentManagementController,
    SettingsManagementController,
  ],
  providers: [
    PrismaService,
    ApprovalManagementService,
    ClassManagementService,
    EnrollmentManagementService,
    FinancialManagementService,
    LeaveRequestsService,
    ScheduleManagementService,
    TeacherManagementService,
    UsersService,
    StudentManagementService,
    IncidentHandleService,
    ParentManagementService,
    SettingsManagementService,
  ],
})
export class AdminCenterModule {}
