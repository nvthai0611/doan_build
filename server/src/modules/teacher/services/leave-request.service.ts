import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async getAffectedSessions(
    teacherId: string,
    startDate: string,
    endDate: string,
  ) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    if (!startDate || !endDate) {
      throw new HttpException('Thiếu tham số ngày', HttpStatus.BAD_REQUEST);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException('Định dạng ngày không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    if (end < start) {
      throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
    }

    // Tìm các buổi dạy mà giáo viên có assignment trong khoảng ngày
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: {
          gte: start,
          lte: end,
        },
        class: {
          teacherClassAssignments: {
            some: {
              teacherId,
              status: 'active',
            },
          },
        },
      },
      select: {
        id: true,
        sessionDate: true,
        startTime: true,
        endTime: true,
        class: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });

    return sessions.map((s) => ({
      id: s.id,
      date: s.sessionDate.toISOString().slice(0, 10),
      time: `${s.startTime} - ${s.endTime}`,
      className: s.class?.name || '',
      room: s.room?.name || '',
      selected: true,
    }));
  }
}
