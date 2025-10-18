import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { ScheduleFiltersDto } from '../dto/schedule/schedule-filters.dto';
import { UpdateScheduleStatusDto } from '../dto/schedule/update-schedule-status.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async getWeeklySchedule(teacherId: string, weekStart: string) {
    try {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const schedules = await this.prisma.classSession.findMany({
        where: {
          sessionDate: {
            gte: startDate,
            lte: endDate
          },
          teacherId: teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { name: true } }
        },
        orderBy: [
          { sessionDate: 'asc' },
          { startTime: 'asc' }
        ]
      });

      return schedules.map(session => ({
        id: session.id,
        date: this.formatDateYYYYMMDD(session.sessionDate),
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.class.subject.name,
        className: session.class.name,
        room: session.room?.name || 'Chưa xác định',
        studentCount: session.class.maxStudents || 0,
        status: session.status,
        notes: session.notes,
        type: 'regular',
        teacherId: session.teacherId,
        academicYear: session.academicYear,
        createdAt: session.createdAt,
        updatedAt: session.createdAt
      }));
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch dạy theo tuần: ${error.message}`);
    }
  }

  async getMonthlySchedule(teacherId: string, year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      const schedules = await this.prisma.classSession.findMany({
        where: {
          sessionDate: {
            gte: startDate,
            lte: endDate
          },
          teacherId: teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } },
            },
          },
          room: { select: { name: true } },
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      });

      return schedules.map((session) => ({
        id: session.id,
        date: this.formatDateYYYYMMDD(session.sessionDate),
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.class.subject.name,
        className: session.class.name,
        room: session.room?.name || 'Chưa xác định',
        studentCount: session.class.maxStudents || 0,
        status: session.status,
        notes: session.notes,
        type: 'regular',
        teacherId: session.teacherId,
        academicYear: session.academicYear,
        createdAt: session.createdAt,
        updatedAt: session.createdAt,
      }));
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch dạy theo tháng: ${error.message}`);
    }
  }

  async getScheduleDetail(teacherId: string, scheduleId: string) {
    try {
      const session = await this.prisma.classSession.findFirst({
        where: {
          id: scheduleId,
          teacherId: teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { name: true } }
        }
      });

      if (!session) {
        return null;
      }

      return {
        id: session.id,
        date: this.formatDateYYYYMMDD(session.sessionDate),
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.class.subject.name,
        className: session.class.name,
        room: session.room?.name || 'Chưa xác định',
        studentCount: session.class.maxStudents || 0,
        status: session.status,
        notes: session.notes,
        type: 'regular',
        teacherId: session.teacherId,
        academicYear: session.academicYear,
        createdAt: session.createdAt,
        updatedAt: session.createdAt
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết buổi dạy: ${error.message}`);
    }
  }

  async updateScheduleStatus(
    teacherId: string, 
    scheduleId: string, 
    updateStatusDto: UpdateScheduleStatusDto
  ) {
    try {
      // Kiểm tra xem buổi dạy có thuộc về giáo viên này không
      const existingSession = await this.prisma.classSession.findFirst({
        where: {
          id: scheduleId,
          teacherId: teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { name: true } }
        }
      });

      if (!existingSession) {
        return null;
      }

      const updatedSession = await this.prisma.classSession.update({
        where: { id: scheduleId },
        data: {
          status: updateStatusDto.status,
          notes: updateStatusDto.notes || existingSession.notes
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { name: true } }
        }
      });

      return {
        id: updatedSession.id,
        date: this.formatDateYYYYMMDD(updatedSession.sessionDate),
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
        subject: updatedSession.class.subject.name,
        className: updatedSession.class.name,
        room: updatedSession.room?.name || 'Chưa xác định',
        studentCount: updatedSession.class.maxStudents || 0,
        status: updatedSession.status,
        notes: updatedSession.notes,
        type: 'regular',
        teacherId: updatedSession.teacherId,
        academicYear: updatedSession.academicYear,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.createdAt
      };
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật trạng thái buổi dạy: ${error.message}`);
    }
  }

  async exportScheduleToExcel(teacherId: string, filters: ScheduleFiltersDto): Promise<Buffer> {
    try {
      // TODO: Implement Excel export sau khi cài đặt exceljs
      throw new Error('Excel export chưa được implement. Cần cài đặt exceljs package.');
    } catch (error) {
      throw new Error(`Lỗi khi xuất Excel: ${error.message}`);
    }
  }

  private getTypeText(type: string): string {
    switch (type) {
      case 'regular': return 'Thường';
      case 'exam': return 'Thi';
      case 'makeup': return 'Học bù';
      default: return type;
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }
}