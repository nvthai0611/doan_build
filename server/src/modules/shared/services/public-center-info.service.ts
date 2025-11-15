import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PublicCenterInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async getCenterInfo() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'center-info' },
    });

    if (!setting) {
      return {
        data: null,
        message: 'Chưa có thông tin trung tâm',
      };
    }

    return {
      data: setting,
      message: 'Lấy thông tin trung tâm thành công',
    };
  }
}

