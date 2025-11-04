import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AcademicTrackingController, GradesController } from './controllers/academic-tracking.controller';
import { ClassInformationController } from './controllers/class-information.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { MaterialsController } from './controllers/materials.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { ProfileController } from './controllers/profile.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AcademicTrackingService } from './services/academic-tracking.service';
import { ClassInformationService } from './services/class-information.service';
import { EnrollmentsService } from './services/enrollments.service';
import { MaterialsService } from './services/materials.service';
import { NotificationsService } from './services/notifications.service';
import { ProfileService } from './services/profile.service';
import { StudentScheduleService } from './services/schedule.service';
import { PrismaService } from 'src/db/prisma.service';
import { MiddlewareStudent } from '../../common/middleware/student/student.middleware';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'student',
        module: StudentModule,
      },
    ]),
  ],
  controllers: [
    AcademicTrackingController,
    GradesController,
    ClassInformationController,
    EnrollmentsController,
    MaterialsController,
    NotificationsController,
    ProfileController,
    ScheduleController,
  ],
  providers: [
    PrismaService,
    AcademicTrackingService,
    ClassInformationService,
    EnrollmentsService,
    MaterialsService,
    NotificationsService,
    ProfileService,
    StudentScheduleService,
  ],
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareStudent).forRoutes('student');
  }
}
