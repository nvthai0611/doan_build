import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { UpdateSettingDto } from '../dto/setting/update-setting.dto';

@Injectable()
export class SettingsManagementService {
  constructor(private prisma: PrismaService) {}

  async getAll(group?: string) {
    const where = group ? { group } : {} as any;
    const items = await this.prisma.systemSetting.findMany({ where, orderBy: { key: 'asc' } });
    return { data: items, message: 'Fetched settings' };
  }

  async getByKey(key: string) {
    const item = await this.prisma.systemSetting.findUnique({ where: { key } });
    return { data: item, message: 'Fetched setting' };
  }

  async upsert(dto: UpdateSettingDto) {
    const { key, group, value, description } = dto;
    const data: any = { key, group, value, description};
    const item = await this.prisma.systemSetting.upsert({
      where: { key },
      update: data,
      create: data,
    });
    return { data: item, message: 'Saved setting' };
  }
}
