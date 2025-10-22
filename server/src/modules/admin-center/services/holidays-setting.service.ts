import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';

@Injectable()
export class HolidaysSettingService {
  constructor(private prisma: PrismaService) {}

  async list(year?: string) {
    const where: any = {};
    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);

      where.startDate = {
          gte: startOfYear,
          lte: endOfYear,
        }
        where.endDate = {
          gte: startOfYear,
          lte: endOfYear,
        }
    }
    const items = await this.prisma.holidayPeriod.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
    return { data: items, message: 'Lấy danh sách kỳ nghỉ thành công' };
  }

  async create(dto: CreateHolidayDto) {
    const { startDate, endDate, note, isActive } = dto as any;
    const startAt = new Date(startDate);
    const endAt = new Date(endDate);
    const created = await this.prisma.holidayPeriod.create({
      data: { startDate: startAt, endDate: endAt, note, isActive: isActive ?? true },
    });
    return { data: created, message: 'Tạo kỳ nghỉ thành công' };
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const existed = await this.prisma.holidayPeriod.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Holiday period not found');
    const updated = await this.prisma.holidayPeriod.update({
      where: { id },
      data: {
        startDate: new Date(dto.startDate) ?? undefined,
        endDate: new Date(dto.endDate) ?? undefined,
        note: dto.note ?? undefined,
        isActive: dto.isActive ?? undefined,
      },
    });
    return { data: updated, message: 'Cập nhật kỳ nghỉ thành công' };
  }

  async remove(id: string) {
    const existed = await this.prisma.holidayPeriod.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Holiday period not found');
    await this.prisma.holidayPeriod.delete({ where: { id } });
    return { data: true, message: 'Xóa kỳ nghỉ thành công' };
  }

  async apply(id: string) {
    const holiday = await this.prisma.holidayPeriod.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException('Holiday period not found');

    // Lấy các phiên học trùng khoảng ngày
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: {
          gte: holiday.startDate,
          lte: holiday.endDate,
        },
      },
      select: { id: true },
    });

    if (sessions.length === 0) {
      return { data: { created: 0 }, message: 'Không có phiên học để liên kết' };
    }

    // Tạo các link vào bảng join, tránh trùng bằng upsert theo composite key
    const created = await this.prisma.$transaction(
      sessions.map(s =>
        this.prisma.holidayPeriodSession.upsert({
          where: { holidayPeriodId_sessionId: { holidayPeriodId: id, sessionId: s.id } },
          create: { holidayPeriodId: id, sessionId: s.id },
          update: {},
        })
      )
    );

    return { data: { created: created.length }, message: 'Liên kết kỳ nghỉ vào phiên học thành công' };
  }
}


