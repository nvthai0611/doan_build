import { Module } from '@nestjs/common';
import { AcademicTrackingController } from './controllers/academic-tracking.controller';
import { ClassInformationController } from './controllers/class-information.controller';
import { CommunicationController } from './controllers/communication.controller';
import { FinancialController } from './controllers/financial.controller';
import { MaterialsController } from './controllers/materials.controller';
import { StudentManagementController } from './controllers/student-management.controller';
import { AcademicTrackingService } from './services/academic-tracking.service';
import { ClassInformationService } from './services/class-information.service';
import { CommunicationService } from './services/communication.service';
import { FinancialService } from './services/financial.service';
import { MaterialsService } from './services/materials.service';
import { StudentManagementService } from './services/student-management.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [],
  controllers: [
    AcademicTrackingController,
    ClassInformationController,
    CommunicationController,
    FinancialController,
    MaterialsController,
    StudentManagementController,
  ],
  providers: [
    PrismaService,
    AcademicTrackingService,
    ClassInformationService,
    CommunicationService,
    FinancialService,
    MaterialsService,
    StudentManagementService,
  ],
})
export class ParentModule {}
