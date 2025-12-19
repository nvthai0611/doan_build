import { SepayController } from './controller/sepay.controller';
// payment.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Services
import { SepayService } from './service/sepay.service';
import { PrismaService } from '../../db/prisma.service';
import { EmailNotificationService } from '../shared/services/email-notification.service';
import { PaymentGateway } from './gateway/payment.gateway';

// Controllers

@Module({
  imports: [
    ConfigModule,
    
    // Cấu hình HttpModule chung
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [
    SepayController,
  ],
  providers: [
    SepayService,
    PaymentGateway,
    PrismaService,
  ],
  exports: [
    SepayService,
    PaymentGateway,
  ],
})
export class PaymentModule {}