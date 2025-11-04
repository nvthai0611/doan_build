import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../../src/db/prisma.service";

@Injectable()
export class BillCronService {
  private readonly logger = new Logger(BillCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron chạy vào lúc 00:00 ngày 1 hàng tháng
   */
  
}