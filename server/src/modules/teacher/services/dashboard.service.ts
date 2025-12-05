import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class TeacherDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(teacherId: string) {
    // Lấy tổng số học sinh từ các lớp giáo viên đang dạy
    const classes = await this.prisma.class.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          where: { status: 'studying' },
        },
      },
    });

    const totalStudents = classes.reduce(
      (sum, cls) => sum + cls.enrollments.length,
      0,
    );
    const totalClasses = classes.length;

    // Lấy ngày hôm nay theo định dạng YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const todaySessions = await this.prisma.classSession.count({
      where: {
        OR: [
          { teacherId },
          { substituteTeacherId: teacherId },
        ],
        sessionDate: {
          equals: new Date(todayStr),
        },
      },
    });

    const completedSessions = await this.prisma.classSession.count({
      where: {
        OR: [
          { teacherId },
          { substituteTeacherId: teacherId },
        ],
        sessionDate: {
          equals: new Date(todayStr),
        },
        status: 'end',
      },
    });

    return {
      totalStudents,
      totalClasses,
      todaySessions,
      completedSessions,
    };
  }

  async getTodaySessions(teacherId: string) {
    // Lấy ngày hôm nay theo định dạng YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const sessions = await this.prisma.classSession.findMany({
      where: {
        OR: [
          { teacherId },
          { substituteTeacherId: teacherId },
        ],
        sessionDate: {
          equals: new Date(todayStr),
        },
      },
      include: {
        class: {
          include: {
            subject: true,
          },
        },
        room: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      className: session.class.name,
      subjectName: session.class.subject?.name || 'Chưa xác định',
      sessionDate: session.sessionDate.toISOString(),
      startTime: session.startTime,
      endTime: session.endTime,
      roomName: session.room?.name || 'Chưa xác định',
      status: session.status,
    }));
  }
}