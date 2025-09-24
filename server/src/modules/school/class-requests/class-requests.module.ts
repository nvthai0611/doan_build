import { Module } from '@nestjs/common';
import { ClassRequestsController } from './class-requests.controller';
import { ClassRequestsService } from './class-requests.service';

@Module({
  controllers: [ClassRequestsController],
  providers: [ClassRequestsService]
})
export class ClassRequestsModule {}
