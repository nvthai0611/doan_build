import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { PostsModule } from './modules/posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middleware/auth/auth.middleware';
// import { RoleMiddleware } from './common/middleware/role/role.middleware';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { PrismaService } from './db/prisma.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ProductsModule,
    PostsModule,
    AuthModule,

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
