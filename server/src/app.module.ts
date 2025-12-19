import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './modules/users/users.module';
// import { ProductsModule } from './modules/products/products.module';
// import { PostsModule } from './modules/posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middleware/auth/auth.middleware';
// import { RoleMiddleware } from './common/middleware/role/role.middleware';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { PrismaService } from './db/prisma.service';

import { StudentsModule } from './modules/manager/students/students.module';
import { ParentModule } from './modules/parent/parent.module';
import { SchoolsModule } from './modules/school/schools/schools.module';
import { ClassRequestsModule } from './modules/school/class-requests/class-requests.module';
import { ClassSessionsModule } from './modules/school/class-sessions/class-sessions.module';
import { SubjectsModule } from './modules/school/subjects/subjects.module';
import { RoomsModule } from './modules/school/rooms/rooms.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { StudentModule } from './modules/student/student.module';
import { AdminCenterModule } from './modules/admin-center/admin-center.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { SharedModule } from './modules/shared/shared.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiKeyMiddleware } from './common/middleware/api-key.middleware';
import { PaymentModule } from './modules/payment/payment.module';
import { TasksModule } from './modules/cronjob/cron.module';
import { AdminitModule } from './modules/adminit/adminit.module';
// ...existing code...

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    // Cấu hình Bull với Redis
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        connectTimeout: 10000,   // 10 giây timeout cho connection
        commandTimeout: 30000,   // 30 giây timeout cho mỗi command (tăng lên để tránh timeout)
        enableReadyCheck: false, // Tắt ready check để tránh timeout
        maxRetriesPerRequest: null, // Retry không giới hạn
      },
      settings: {
        stalledInterval: 10000,  // 10 giây - kiểm tra job bị stuck
        maxStalledCount: 3,      // Chỉ cho phép 3 lần stalled
        lockDuration: 30000,     // Job được lock trong 30s
        lockRenewTime: 10000,    // Renew lock mỗi 10s
      },
    }),
    AuthModule,
    TeacherModule,
    StudentModule,
    StudentsModule,
    ParentModule,
    SchoolsModule,
    ClassRequestsModule,
    ClassSessionsModule,
    SubjectsModule,
    RoomsModule,
    AdminCenterModule,
    CloudinaryModule,
    SharedModule,
    PaymentModule,
    TasksModule,
    AdminitModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    PrismaService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditLogInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // thích cấu hình như nào thì cấu hình
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'auth/profile',
        method: RequestMethod.GET,
      },
      {
        path: 'auth/logout',
        method: RequestMethod.POST,
      },
    );
    // {path: 'users', method: RequestMethod.GET} // áp dụng cho tất cả
    // consumer.apply(RoleMiddleware).forRoutes('users'); // chỉ áp dụng cho router users
  }
}
