import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ScheduleChangeAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getScheduleChanges(query: any) {
    const {
      page = 1,
      limit = 10,
      status,
      classId,
      teacherId,
    } = query.params;

    const where: any = {};
    if (status) where.status = status;
    if (classId) where.classId = classId;
    if (teacherId) where.requestedBy = teacherId;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.scheduleChange.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { requestedAt: 'desc' },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: { select: { name: true } },
              teacher: {
                include: {
                  user: { select: { fullName: true, email: true } },
                },
              },
            },
          },
          newRoom: { select: { id: true, name: true, capacity: true } },
        },
      }),
      this.prisma.scheduleChange.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScheduleChangeById(id: string) {
    const sc = await this.prisma.scheduleChange.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true } },
            teacher: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
        newRoom: { select: { id: true, name: true, capacity: true } },
      },
    });

    if (!sc) {
      throw new NotFoundException('Không tìm thấy yêu cầu dời lịch');
    }

    return sc;
  }

  async handleScheduleChange(id: string, action: 'approve' | 'reject', notes?: string) {
    if (!['approve', 'reject'].includes(action)) {
      throw new BadRequestException('Hành động không hợp lệ');
    }

    const sc = await this.prisma.scheduleChange.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            teacherId: true,
          },
        },
      },
    });
    if (!sc) throw new NotFoundException('Không tìm thấy yêu cầu dời lịch');

    if (sc.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý');
    }

    // If approving, re-check schedule conflicts with latest data
    if (action === 'approve') {
      const [newStartTimeRaw, newEndTimeRaw] = (sc.newTime || '').split('-');
      const newStartTime = (newStartTimeRaw || '').trim();
      const newEndTime = (newEndTimeRaw || newStartTimeRaw || '').trim();

      if (!newStartTime || !newEndTime) {
        throw new BadRequestException('Thiếu thông tin giờ bắt đầu/kết thúc mới');
      }

      const conflict = await this.checkScheduleConflict(
        sc.newDate,
        newStartTime,
        newEndTime,
        sc.newRoomId || undefined,
        sc.class?.teacherId || undefined,
      );

      if (conflict.hasConflict) {
        throw new BadRequestException(conflict.message);
      }
    }

    const updated = await this.prisma.scheduleChange.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date(),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true } },
            teacher: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
        newRoom: { select: { id: true, name: true, capacity: true } },
      },
    });

    return updated;
  }

  /**
   * Kiểm tra xung đột lịch khi dời buổi (admin duyệt)
   * - Check phòng: cùng phòng, cùng ngày, khung giờ overlap
   * - Check giáo viên: cùng giáo viên, cùng ngày, khung giờ overlap
   */
  private async checkScheduleConflict(
    newDate: Date,
    newStartTime: string,
    newEndTime: string,
    newRoomId?: string,
    teacherId?: string,
  ): Promise<{ hasConflict: boolean; message: string }> {
    const sessionDate = newDate;

    // Check room availability
    if (newRoomId) {
      const roomConflict = await this.prisma.classSession.findFirst({
        where: {
          roomId: newRoomId,
          sessionDate,
          status: { notIn: ['cancelled', 'end'] },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (roomConflict) {
        return {
          hasConflict: true,
          message: 'Phòng học đã được sử dụng trong khoảng thời gian này',
        };
      }
    }

    // Check teacher availability
    if (teacherId) {
      const teacherConflict = await this.prisma.classSession.findFirst({
        where: {
          class: {
            teacherId,
          },
          sessionDate,
          status: { notIn: ['cancelled', 'end'] },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (teacherConflict) {
        return {
          hasConflict: true,
          message: 'Giáo viên đã có buổi dạy khác trong khoảng thời gian này',
        };
      }
    }

    return { hasConflict: false, message: '' };
  }
}

