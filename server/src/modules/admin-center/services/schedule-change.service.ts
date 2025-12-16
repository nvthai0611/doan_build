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

    const sc = await this.prisma.scheduleChange.findUnique({ where: { id } });
    if (!sc) throw new NotFoundException('Không tìm thấy yêu cầu dời lịch');

    if (sc.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý');
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
}

