import { Module } from '@nestjs/common';
import { StudentParentLinksService } from './student-parent-links.service';
import { StudentParentLinksController } from './student-parent-links.controller';

@Module({
  controllers: [StudentParentLinksController],
  providers: [StudentParentLinksService],
})
export class StudentParentLinksModule {}
