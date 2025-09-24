import { Module } from '@nestjs/common';
import { StudentParentLinkController } from './student-parent-link.controller';
import { StudentParentLinkService } from './student-parent-link.service';

@Module({
  controllers: [StudentParentLinkController],
  providers: [StudentParentLinkService]
})
export class StudentParentLinkModule {}
