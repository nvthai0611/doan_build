import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { ScheduleFiltersDto } from '../dto/schedule-filters.dto';

@Injectable()
export class StudentScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklySchedule(studentId: string, weekStart: string) {
    if (!studentId || !weekStart) return [];
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: { gte: start, lte: end },
        class: {
          enrollments: {
            some: {
              studentId,
              status: 'active',
            },
          },
        },
      },
      include: {
        class: { 
          include: { 
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          } 
        },
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        attendances: {
          where: { studentId },
          select: { 
            id: true, 
            status: true, 
            note: true, 
            recordedAt: true,
            recordedByUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          take: 1,
        },
      },
      orderBy: [
        { sessionDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return sessions.map((s: any) => ({
      ...s,
      attendanceStatus: s.attendances?.[0]?.status ?? null,
      attendanceNote: s.attendances?.[0]?.note ?? null,
      attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
      attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
    }));
  }

  async getMonthlySchedule(studentId: string, year: number, month: number) {
    if (!studentId || !year || !month) return [];
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: { gte: start, lte: end },
        class: {
          enrollments: {
            some: {
              studentId,
              status: 'active',
            },
          },
        },
      },
      include: {
        class: { 
          include: { 
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          } 
        },
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        attendances: {
          where: { studentId },
          select: { 
            id: true, 
            status: true, 
            note: true, 
            recordedAt: true,
            recordedByUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          take: 1,
        },
      },
      orderBy: [
        { sessionDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return sessions.map((s: any) => ({
      ...s,
      attendanceStatus: s.attendances?.[0]?.status ?? null,
      attendanceNote: s.attendances?.[0]?.note ?? null,
      attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
      attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
    }));
  }

  async getSchedule(studentId: string, filters: ScheduleFiltersDto) {
    if (!studentId) return [];
    const { startDate, endDate } = filters || {};

    // Lấy danh sách buổi học (class_sessions) mà học sinh này có ghi danh (enrollments)
    // Kèm theo trạng thái điểm danh (student_session_attendance) của chính học sinh cho từng buổi
    const sessions = await this.prisma.classSession.findMany({
      where: {
        ...(startDate ? { sessionDate: { gte: new Date(startDate) } } : {}),
        ...(endDate ? { sessionDate: { lte: new Date(endDate) } } : {}),
        class: {
          enrollments: {
            some: {
              studentId,
              status: 'active',
            },
          },
        },
      },
      include: {
        class: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          },
        },
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        attendances: {
          where: { studentId },
          select: { 
            id: true, 
            status: true, 
            note: true, 
            recordedAt: true,
            recordedByUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          take: 1,
        },
      },
      orderBy: [
        { sessionDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // Chuẩn hoá output: gắn trực tiếp attendanceStatus (nếu có) cho tiện frontend
    return sessions.map((s: any) => ({
      ...s,
      attendanceStatus: s.attendances?.[0]?.status ?? null,
      attendanceNote: s.attendances?.[0]?.note ?? null,
      attendanceRecordedAt: s.attendances?.[0]?.recordedAt ?? null,
      attendanceRecordedBy: s.attendances?.[0]?.recordedByUser ?? null,
    }));
  }

  async getSessionById(studentId: string, sessionId: string) {
    if (!studentId || !sessionId) return null;
    
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { 
          include: { 
            subject: true, 
            teacher: { 
              include: { 
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                } 
              } 
            } 
          } 
        },
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        attendances: { 
          where: { studentId }, 
          select: {
            id: true,
            status: true,
            note: true,
            recordedAt: true,
            recordedByUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          take: 1 
        },
      },
    });

    if (!session) return null;

    // Kiểm tra xem học sinh có được ghi danh vào lớp này không
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        classId: session.classId,
        status: 'active'
      }
    });

    if (!enrollment) {
      throw new Error('Học sinh không được ghi danh vào lớp này');
    }

    return {
      ...session,
      attendanceStatus: session.attendances?.[0]?.status ?? null,
      attendanceNote: session.attendances?.[0]?.note ?? null,
      attendanceRecordedAt: session.attendances?.[0]?.recordedAt ?? null,
      attendanceRecordedBy: session.attendances?.[0]?.recordedByUser ?? null,
    };
  }

  async getScheduleDetail(studentId: string, id: string) {
    if (!studentId || !id) return null;
    
    // Tìm session theo id và kiểm tra quyền truy cập
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: { 
          include: { 
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          } 
        },
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        attendances: { 
          where: { studentId }, 
          select: {
            id: true,
            status: true,
            note: true,
            recordedAt: true,
            recordedByUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          take: 1 
        },
      },
    });

    if (!session) return null;

    // Kiểm tra xem học sinh có được ghi danh vào lớp này không
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        classId: session.classId,
        status: 'active'
      }
    });

    if (!enrollment) {
      throw new Error('Học sinh không được ghi danh vào lớp này');
    }

    return {
      ...session,
      attendanceStatus: session.attendances?.[0]?.status ?? null,
      attendanceNote: session.attendances?.[0]?.note ?? null,
      attendanceRecordedAt: session.attendances?.[0]?.recordedAt ?? null,
      attendanceRecordedBy: session.attendances?.[0]?.recordedByUser ?? null,
    };
  }
}
