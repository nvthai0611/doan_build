import { SepayController } from './controller/sepay.controller';
// payment.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Services
import { SepayService } from './service/sepay.service';
import { PrismaService } from '../../db/prisma.service';
import { EmailNotificationService } from '../shared/services/email-notification.service';

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
  ],
  controllers: [
    SepayController,
  ],
  providers: [
    SepayService,
    PrismaService,
  ],
  exports: [
    SepayService,
  ],
})
export class PaymentModule {}