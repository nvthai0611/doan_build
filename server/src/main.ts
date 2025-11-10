import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { verifyEmailConnection } from './utils/email.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Prefix cho toàn bộ API (vd: /api/v1)
  const API_PREFIX = 'api/v1';
  app.setGlobalPrefix(API_PREFIX);

  //Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, 
      },
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

  //Interceptor + Filter
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  //CORS + cookie
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.use(cookieParser());

  //Swagger config (gắn theo version)
  const config = new DocumentBuilder()
    .setTitle('API COMMON')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('API ALL')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Swagger nằm trong cùng prefix với API
  //http://localhost:9999/api/v1/docs
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory);

  // Verify SMTP connection khi khởi động (không block, chạy async)
  // Chỉ verify nếu có cấu hình SMTP
  if (process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
    verifyEmailConnection().catch(() => {
      // Ignore errors, app vẫn chạy bình thường
      // Email sẽ fail khi gửi nếu connection không hợp lệ
    });
  }

  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
