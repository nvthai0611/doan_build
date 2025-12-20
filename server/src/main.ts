import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { verifyEmailConnection } from './utils/email.util';
import * as net from 'net'; // <--- 1. IMPORT THƯ VIỆN NET

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
      if (!origin) return callback(null, true);
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

  //Swagger config
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
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory);

  // --- 2. ĐOẠN CODE TEST MẠNG (THAY THẾ SHELL) ---
  // Đoạn này sẽ chạy song song khi server khởi động
  const testHost = process.env.SMTP_HOST || 'smtp.gmail.com'; 
  const testPort = Number(process.env.SMTP_PORT) || 587;

  console.log(`[NETWORK TEST] 📡 Đang thử kết nối đến: ${testHost}:${testPort} ...`);

  const socket = new net.Socket();
  socket.setTimeout(5000); // Timeout sau 5 giây nếu không kết nối được

  socket.on('connect', () => {
    console.log(`[NETWORK TEST] ✅ KẾT NỐI THÀNH CÔNG đến ${testHost}:${testPort}`);
    console.log(`[NETWORK TEST] => Mạng OK. Nếu vẫn lỗi Email thì do Sai Mật Khẩu/User.`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`[NETWORK TEST] ❌ TIMEOUT - Render KHÔNG THỂ kết nối đến ${testHost}:${testPort}`);
    console.log(`[NETWORK TEST] => Vấn đề do Render chặn mạng hoặc Server Mail chặn IP này.`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`[NETWORK TEST] ❌ LỖI KẾT NỐI: ${err.message}`);
    socket.destroy();
  });

  // Bắt đầu kết nối
  socket.connect(testPort, testHost);
  // ------------------------------------------------

  // Verify SMTP connection (Của bạn)
  if (process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
    verifyEmailConnection().catch((err) => {
       console.warn('[Email Warning] Verify failed (check logs above for Network Test)');
    });
  }

  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
