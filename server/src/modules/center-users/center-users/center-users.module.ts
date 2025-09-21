import { Module } from '@nestjs/common';
import { CenterUsersService } from './center-users.service';
import { CenterUsersController } from './center-users.controller';

@Module({
  controllers: [CenterUsersController],
  providers: [CenterUsersService],
})
export class CenterUsersModule {}
