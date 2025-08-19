import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (ValidationError: ValidationError[]) => {
        const newError = ValidationError.map((error: ValidationError) => {
          return {
            [error.property]: Object.values(error.constraints)[0],
          };
        });
        return new BadRequestException(newError);
      },
    }),
  ); // validate tự động trong nestjs khi có request
  app.enableCors({
    origin: 'http://localhost:3000', // Origin cho phép
    methods: 'GET,POST,PUT,DELETE', // Các HTTP method cho phép
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
