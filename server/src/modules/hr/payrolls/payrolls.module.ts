import { Module } from '@nestjs/common';
import { PayrollsController } from './payrolls.controller';
import { PayrollsService } from './payrolls.service';

@Module({
  controllers: [PayrollsController],
  providers: [PayrollsService]
})
export class PayrollsModule {}
