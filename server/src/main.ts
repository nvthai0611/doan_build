import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // tự động validate khi có req gửi xuống
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
  );
  app.enableCors({
    origin: 'http://localhost:3000', // Origin cho phép
    methods: 'GET,POST,PUT,DELETE', // Các HTTP method cho phép
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
  });
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('API COMMON')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('API ALL')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
