import { Module } from '@nestjs/common';
import { StudentSharedService } from './services/student.service';
import { StudentsSharedController } from './controllers/students.controller';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  controllers:[
    // Shared controllers can be added here
    StudentsSharedController
  ],
  providers: [
    // Shared services can be added here
    StudentSharedService,
    PrismaService
  ],
  exports: [StudentSharedService],
})
export class SharedModule {}
