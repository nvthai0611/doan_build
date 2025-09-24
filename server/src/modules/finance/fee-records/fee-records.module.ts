import { Module } from '@nestjs/common';
import { FeeRecordsController } from './fee-records.controller';
import { FeeRecordsService } from './fee-records.service';

@Module({
  controllers: [FeeRecordsController],
  providers: [FeeRecordsService]
})
export class FeeRecordsModule {}
