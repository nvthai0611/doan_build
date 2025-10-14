import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class IncidentReportService {
  constructor(private readonly prisma: PrismaService) {}

  async createIncidentReport(teacherId: string, body: any) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const {
      incidentType,
      severity,
      date,
      time,
      location,
      description,
      actionsTaken,
      studentsInvolved,
      witnessesPresent,
      classId,
    } = body || {};

    if (!incidentType || !severity || !description) {
      throw new HttpException('Thiếu dữ liệu bắt buộc', HttpStatus.BAD_REQUEST);
    }

    const data: any = {
      incidentType,
      severity,
      date: new Date(date || new Date()),
      time: time || new Date().toTimeString().slice(0, 5),
      location: location || null,
      description,
      actionsTaken: actionsTaken || null,
      studentsInvolved: studentsInvolved || null,
      witnessesPresent: witnessesPresent || null,
      reportedById: teacherId,
      status: 'PENDING',
    };

    if (classId && checkId(classId)) {
      data.classId = classId;
    }

    const created = await this.prisma.incidentReport.create({ data });
    return {
      data: created,
      message: 'Tạo báo cáo sự cố thành công',
    };
  }

  async getMyIncidentReports(
    teacherId: string,
    options: { page: number; limit: number; status?: string },
  ) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: any = { reportedById: teacherId };
    if (status) where.status = status;

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

  async getIncidentReportDetail(teacherId: string, id: string) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    if (!id || !checkId(id)) {
      throw new HttpException('ID báo cáo không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const item = await this.prisma.incidentReport.findFirst({
      where: { id, reportedById: teacherId },
      include: { class: true, reportedBy: { include: { user: true } } },
    });

    if (!item) {
      throw new HttpException('Không tìm thấy báo cáo', HttpStatus.NOT_FOUND);
    }

    return {
      data: item,
      message: 'Lấy chi tiết báo cáo sự cố thành công',
    };
  }
}


