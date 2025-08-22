import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Prefix cho toàn bộ API (vd: /api/v1)
  const API_PREFIX = 'api/v1';
  app.setGlobalPrefix(API_PREFIX);

  //Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
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
    .addTag('API ALL')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Swagger nằm trong cùng prefix với API
  //http://localhost:9999/api/v1/docs
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory);

  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
