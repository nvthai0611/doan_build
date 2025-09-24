import { Module } from '@nestjs/common';
import { AcademicTrackingController } from './controllers/academic-tracking.controller';
import { ClassInformationController } from './controllers/class-information.controller';
import { MaterialsController } from './controllers/materials.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { ProfileController } from './controllers/profile.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AcademicTrackingService } from './services/academic-tracking.service';
import { ClassInformationService } from './services/class-information.service';
import { MaterialsService } from './services/materials.service';
import { NotificationsService } from './services/notifications.service';
import { ProfileService } from './services/profile.service';
import { ScheduleService } from './services/schedule.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [],
  controllers: [
    AcademicTrackingController,
    ClassInformationController,
    MaterialsController,
    NotificationsController,
    ProfileController,
    ScheduleController,
  ],
  providers: [
    PrismaService,
    AcademicTrackingService,
    ClassInformationService,
    MaterialsService,
    NotificationsService,
    ProfileService,
    ScheduleService,
  ],
})
export class StudentModule {}
