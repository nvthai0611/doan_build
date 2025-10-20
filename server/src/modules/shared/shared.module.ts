import { Module } from '@nestjs/common';
import { StudentSharedService } from './services/student.service';
import { StudentsSharedController } from './controllers/students.controller';
import { PrismaService } from 'src/db/prisma.service';
import { GradesController } from './controllers/grades.controller';
import { GradeService } from './services/grade.service';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'shared',
        module: SharedModule,
      },
    ]),
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
  ],
  exports: [StudentSharedService, GradeService, PrismaService],
  
})
export class SharedModule {}
