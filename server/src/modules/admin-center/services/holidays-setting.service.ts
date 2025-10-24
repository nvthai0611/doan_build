import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    
    // Check for overlapping holidays
    const overlappingHoliday = await this.checkOverlappingHolidays(startAt, endAt);
    if (overlappingHoliday) {
      throw new ConflictException(
        `Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại từ ${overlappingHoliday.startDate.toLocaleDateString('vi-VN')} đến ${overlappingHoliday.endDate.toLocaleDateString('vi-VN')}`
      );
    }
    
    const created = await this.prisma.holidayPeriod.create({
      data: { startDate: startAt, endDate: endAt, note, isActive: isActive ?? true },
    });
    return { data: created, message: 'Tạo kỳ nghỉ thành công' };
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const existed = await this.prisma.holidayPeriod.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Holiday period not found');
    
    // If dates are being updated, check for overlaps
    if (dto.startDate || dto.endDate) {
      const newStartDate = dto.startDate ? new Date(dto.startDate) : existed.startDate;
      const newEndDate = dto.endDate ? new Date(dto.endDate) : existed.endDate;
      
      const overlappingHoliday = await this.checkOverlappingHolidays(newStartDate, newEndDate, id);
      if (overlappingHoliday) {
        throw new ConflictException(
          `Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại từ ${overlappingHoliday.startDate.toLocaleDateString('vi-VN')} đến ${overlappingHoliday.endDate.toLocaleDateString('vi-VN')}`
        );
      }
    }
    
    const updated = await this.prisma.holidayPeriod.update({
      where: { id },
      data: {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
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

  /**
   * Check for overlapping holiday periods
   * @param startDate Start date of the new/updated holiday
   * @param endDate End date of the new/updated holiday
   * @param excludeId ID to exclude from overlap check (for updates)
   * @returns Overlapping holiday if found, null otherwise
   */
  private async checkOverlappingHolidays(startDate: Date, endDate: Date, excludeId?: string) {
    const where: any = {
      OR: [
        // New holiday starts within existing holiday
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } }
          ]
        },
        // New holiday ends within existing holiday
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        // New holiday completely contains existing holiday
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        },
        // Existing holiday completely contains new holiday
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: endDate } }
          ]
        }
      ]
    };

    // Exclude current holiday when updating
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const overlappingHoliday = await this.prisma.holidayPeriod.findFirst({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        note: true
      }
    });

    return overlappingHoliday;
  }
}


