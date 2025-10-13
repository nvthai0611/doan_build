import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { AdminCenterModule } from './modules/admin-center/admin-center.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { SharedModule } from './modules/shared/shared.module';
// ...existing code...

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    TeacherModule,
    StudentsModule,
    ParentModule,
    SchoolsModule,
    ClassRequestsModule,
    ClassSessionsModule,
    SubjectsModule,
    RoomsModule,
    AdminCenterModule,
    CloudinaryModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // thích cấu hình như nào thì cấu hình
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
