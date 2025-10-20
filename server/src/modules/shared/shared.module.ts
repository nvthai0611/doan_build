import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StudentSharedService } from './services/student.service';
import { StudentsSharedController } from './controllers/students.controller';
import { PrismaService } from 'src/db/prisma.service';
import { GradesController } from './controllers/grades.controller';
import { GradeService } from './services/grade.service';
import { RouterModule } from '@nestjs/core';
import { EmailQueueService } from './services/email-queue.service';
import { EmailProcessor } from './services/email-processor.service';
import { EmailNotificationService } from './services/email-notification.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'shared',
        module: SharedModule,
      },
    ]),
    // Cấu hình Bull queue cho email
    BullModule.registerQueue({
      name: 'email',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  controllers:[
    // Shared controllers can be added here
    StudentsSharedController,
    GradesController
  ],
  providers: [
    // Shared services can be added here
    PrismaService,
    StudentSharedService,
    GradeService,
    EmailQueueService,
    EmailProcessor,
    EmailNotificationService,
  ],
  exports: [
    StudentSharedService, 
    GradeService, 
    PrismaService,
    EmailQueueService,
    EmailNotificationService,
  ],
  
})
export class SharedModule {}
