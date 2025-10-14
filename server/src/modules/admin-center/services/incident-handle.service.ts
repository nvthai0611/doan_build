import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class IncidentHandleService {
  constructor(private readonly prisma: PrismaService) {}

  async listIncidents(options: { page: number; limit: number; status?: string; severity?: string }) {
    const { page, limit, status, severity } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (severity) where.severity = severity;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.incidentReport.count({ where }),
      this.prisma.incidentReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          reportedBy: { include: { user: true } },
        },
      }),
    ]);

    return {
      data: items,
      message: 'Lấy danh sách báo cáo sự cố thành công',
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: string) {
    if (!id || !checkId(id)) {
      throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.incidentReport.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });
    return { data: updated, message: 'Cập nhật trạng thái thành công' };
  }
}


