import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class SessionSchedulerService {
  private readonly logger = new Logger(SessionSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job chạy mỗi ngày lúc 00:00 để cập nhật status của sessions
   * Dựa trên khoảng cách giữa sessionDate và ngày hiện tại:
   * - < 3 ngày: happening (đang diễn ra)
   * - >= 3 ngày: has_not_happened (chưa diễn ra)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateSessionStatus() {
    this.logger.log('🔄 Starting session status update cron job...');

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of day

      // Tính ngày 3 ngày từ bây giờ
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Update sessions < 3 ngày sang 'happening'
      const happeningResult = await this.prisma.classSession.updateMany({
        where: {
          sessionDate: {
            gte: now,
            lt: threeDaysFromNow,
          },
          status: {
            in: ['has_not_happened', 'happening'], // Chỉ update những session chưa end hoặc cancelled
          },
        },
        data: {
          status: 'happening',
        //   updatedAt: new Date(),
        },
      });

      // Update sessions >= 3 ngày sang 'has_not_happened'
      const notHappenedResult = await this.prisma.classSession.updateMany({
        where: {
          sessionDate: {
            gte: threeDaysFromNow,
          },
          status: {
            notIn: ['end', 'cancelled'], // Không update sessions đã kết thúc hoặc đã hủy
          },
        },
        data: {
          status: 'has_not_happened',
        //   updated_at: new Date(),
        },
      });

      this.logger.log(
        `✅ Updated ${happeningResult.count} sessions to 'happening' (< 3 days)`,
      );
      this.logger.log(
        `✅ Updated ${notHappenedResult.count} sessions to 'has_not_happened' (>= 3 days)`,
      );
    } catch (error) {
      this.logger.error('❌ Error updating session status:', error);
    }
  }

  /**
   * Cron job để tự động chuyển sessions đã qua ngày sang 'end'
   * Chạy mỗi ngày lúc 23:59
   */
  @Cron('59 23 * * *')
  async markPastSessionsAsEnded() {
    this.logger.log('🔄 Marking past sessions as ended...');

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const result = await this.prisma.classSession.updateMany({
        where: {
          sessionDate: {
            lt: now,
          },
          status: {
            in: ['happening', 'has_not_happened'],
          },
        },
        data: {
          status: 'end',
        //   updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Marked ${result.count} past sessions as 'end'`);
    } catch (error) {
      this.logger.error('❌ Error marking past sessions as ended:', error);
    }
  }
}

