import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PrismaService } from 'src/db/prisma.service';
import { MiddlewareAdminit } from 'src/common/middleware/adminit/adminit.middleware';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogService } from './services/audit-log.service';
import { UsersService } from './services/user-management.service';
import { UsersController } from './controllers/user-management.controller';

@Module({
  imports: [
    RouterModule.register([
      {
        path: "adminit",
        module: AdminitModule,
      }, 
    ]),
  ],
  controllers: [AuditLogController, UsersController],
  providers: [PrismaService, AuditLogService, UsersService],
  exports: [AuditLogService, UsersService],

})
//check
export class AdminitModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiddlewareAdminit)
      .forRoutes(
        { path: 'adminit/*', method: RequestMethod.ALL }
      );
  }
}
