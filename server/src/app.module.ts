import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { PostsModule } from './modules/posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middleware/auth/auth.middleware';
// import { RoleMiddleware } from './common/middleware/role/role.middleware';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { PrismaService } from './db/prisma.service';
import { UsersModule } from './modules/users/users/users.module';
import { TeachersModule } from './modules/teachers/teachers/teachers.module';
import { StudentsModule } from './modules/students/students/students.module';
import { ParentsModule } from './modules/parents/parents/parents.module';
import { StudentParentLinksModule } from './modules/student-parent-links/student-parent-links/student-parent-links.module';
import { CentersModule } from './modules/centers/centers/centers.module';
import { CenterUsersModule } from './modules/center-users/center-users/center-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    UsersModule,
    ProductsModule,
    PostsModule,
    AuthModule,
    TeachersModule,
    StudentsModule,
    ParentsModule,
    StudentParentLinksModule,
    CentersModule,
    CenterUsersModule,
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
