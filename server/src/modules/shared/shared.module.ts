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
import { EmailNotificationProcessor } from './consumer/email_notification.processor';
import { TeacherAccountProcessor } from './consumer/teacher_account.processor';
import { ClassAssignTeacherProcessor } from './consumer/class_assign_teacher.processor';
import { EnrollmentEmailProcessor } from './consumer/enrollment-email.processor';
import { PublicClassesController } from './controllers/public-classes.controller';
import { PublicClassesService } from './services/public-classes.service';
  
const DEFAULT_BULL_JOB_OPTIONS = {
  removeOnComplete: 10, // Giữ lại 10 job hoàn thành gần nhất
  removeOnFail: 5,      // Giữ lại 5 job thất bại gần nhất
  attempts: 3,          // Số lần thử lại nếu job thất bại
  backoff: {
    type: 'exponential', // Độ trễ tăng theo hàm mũ khi thử lại
    delay: 2000,         // Độ trễ ban đầu (2 giây)
  },
};
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
      defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,         
    }),
    BullModule.registerQueue({
      name: 'email_notification',
      defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,         
    }),
    BullModule.registerQueue({
      name: 'teacher_account',
      defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,         
    }),
    BullModule.registerQueue({
      name: 'class_assign_teacher',
      defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,         
    }),
    BullModule.registerQueue({
      name: 'enrollment_email',
      defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,         
    }),
  ],
  controllers:[
    // Shared controllers can be added here
    StudentsSharedController,
    GradesController,
    PublicClassesController
  ],
  providers: [
    // Shared services can be added here
    PrismaService,
    StudentSharedService,
    GradeService,
    PublicClassesService,
    EmailQueueService,
    EmailProcessor,
    EmailNotificationService,
    EmailNotificationProcessor,
    TeacherAccountProcessor,
    ClassAssignTeacherProcessor,
    EnrollmentEmailProcessor
  ],
  exports: [
    StudentSharedService, 
    GradeService, 
    PrismaService,
    EmailQueueService,
    EmailNotificationService, // Export để các module khác sử dụng
  ],
  
})
export class SharedModule {}
