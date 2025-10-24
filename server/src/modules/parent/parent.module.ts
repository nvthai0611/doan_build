import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AcademicTrackingController } from './controllers/academic-tracking.controller';
import { ClassInformationController } from './controllers/class-information.controller';
import { CommunicationController } from './controllers/communication.controller';
import { FinancialController } from './controllers/financial.controller';
import { MaterialsController } from './controllers/materials.controller';
import { StudentManagementController } from './controllers/student-management.controller';
import { StudentLeaveRequestController } from './controllers/student-leave-request.controller';
import { ChildClassesController } from './controllers/child-classes.controller';
import { ClassJoinController } from './controllers/class-join.controller';
import { AcademicTrackingService } from './services/academic-tracking.service';
import { ClassInformationService } from './services/class-information.service';
import { CommunicationService } from './services/communication.service';
import { FinancialService } from './services/financial.service';
import { MaterialsService } from './services/materials.service';
import { StudentManagementService } from './services/student-management.service';
import { StudentLeaveRequestService } from './services/student-leave-request.service';
import { ClassJoinService } from './services/class-join.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'parent',
        module: ParentModule,
      },
    ]),
  ],
  controllers: [
    AcademicTrackingController,
    ClassInformationController,
    CommunicationController,
    FinancialController,
    MaterialsController,
    StudentManagementController,
    StudentLeaveRequestController,
    ChildClassesController,
    ClassJoinController,
  ],
  providers: [
    PrismaService,
    AcademicTrackingService,
    ClassInformationService,
    CommunicationService,
    FinancialService,
    MaterialsService,
    StudentManagementService,
    StudentLeaveRequestService,
    ClassJoinService,
  ],
})
export class ParentModule {}
