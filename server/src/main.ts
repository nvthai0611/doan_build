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
  const isProduction = process.env.NODE_ENV === 'production';
  
  const allowedOrigins = isProduction
    ? [
        'https://thayquang.site',
        'https://www.thayquang.site',
        process.env.FRONTEND_URL,
      ].filter(Boolean)
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.some(allowed => {
        if (!allowed) return false;
        return allowed === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
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
