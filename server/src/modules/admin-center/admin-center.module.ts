import { Module } from '@nestjs/common';
import { ApprovalManagementController } from './controllers/approval-management.controller';
// import { ClassManagementController } from './controllers/class-management.controller';
import { FinancialManagementController } from './controllers/financial-management.controller';
import { ScheduleManagementController } from './controllers/schedule-management.controller';
import { TeacherManagementController } from './controllers/teacher-management.controller';
import { UsersController } from './controllers/user-management.controller';
import { ApprovalManagementService } from './services/approval-management.service';
// import { ClassManagementService } from './services/class-management.service';
import { FinancialManagementService } from './services/financial-management.service';
import { ScheduleManagementService } from './services/schedule-management.service';
import { TeacherManagementService } from './services/teacher-management.service';
import { UsersService } from './services/user-management.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [],
  controllers: [
    ApprovalManagementController,
    // ClassManagementController,
    FinancialManagementController,
    ScheduleManagementController,
    TeacherManagementController,
    UsersController,
  ],
  providers: [
    PrismaService,
    ApprovalManagementService,
    // ClassManagementService,
    FinancialManagementService,
    ScheduleManagementService,
    TeacherManagementService,
    UsersService,
  ],
})
export class AdminCenterModule {}
