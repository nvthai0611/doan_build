import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassNotificationService } from '../services/class-notification.service';
import * as crypto from 'crypto';

// Make crypto globally available for @nestjs/schedule
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}

@Injectable()
export class ClassNotificationCronService {
  private readonly logger = new Logger(ClassNotificationCronService.name);

  constructor(
    private readonly classNotificationService: ClassNotificationService,
  ) {}

  /**
   * Cron job chạy mỗi ngày lúc 08:00 để kiểm tra và tạo thông báo 
   * cho các lớp sắp bắt đầu và sắp kết thúc (EVERY_1ST_DAY_OF_MONTH_AT_NOON ,EVERY_10_SECONDS)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)  
  async checkClassNotifications() {
    this.logger.log('Bắt đầu kiểm tra thông báo lớp học...');

    try {
      // Kiểm tra lớp sắp bắt đầu
      await this.classNotificationService.checkClassesStartingSoon();

      // Kiểm tra lớp sắp kết thúc
      await this.classNotificationService.checkClassesEndingSoon();

      this.logger.log('Hoàn thành kiểm tra thông báo lớp học');
    } catch (error) {
      this.logger.error('Lỗi khi kiểm tra thông báo lớp học:', error);
    }
  }

  /**
   * Cron job test - chạy mỗi phút (để test, có thể xóa sau)
   * Uncomment dòng dưới để test
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  // async testClassNotifications() {
  //   this.logger.log('TEST: Kiểm tra thông báo lớp học...');
  //   await this.checkClassNotifications();
  // }
}
