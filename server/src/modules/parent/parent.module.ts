import { MiddlewareParent } from './../../common/middleware/parent/parent.middleware';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { ChildTeacherFeedbackController } from './controllers/child-teacher-feedback.controller';
import { ChildTeacherFeedbackService } from './services/child-teacher-feedback.service';
import { ParentOverviewController } from './controllers/parent-overview.controller';
import { ParentOverviewService } from './services/parent-overview.service';
import { CommitmentsController } from './controllers/commitments.controller';
import { CommitmentsService } from './services/commitments.service';
import { AdminCenterModule } from '../admin-center/admin-center.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'parent',
        module: ParentModule,
      },
    ]),
    AdminCenterModule, // Import để sử dụng AlertService
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
  ChildTeacherFeedbackController,
    ParentOverviewController,
    CommitmentsController,
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
    ChildTeacherFeedbackService,
      ParentOverviewService,
    CommitmentsService,
    CloudinaryService,
  ],
})
export class ParentModule {
  configure(consumer: MiddlewareConsumer){
    consumer
          .apply(MiddlewareParent)
          .forRoutes(
            { path: 'parent/*', method: RequestMethod.ALL }
          );
  }
}
