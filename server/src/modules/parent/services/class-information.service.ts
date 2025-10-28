import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ClassInformationService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lấy danh sách lớp học của con
   */
  async getChildClasses(parentUserId: string, studentId: string) {
    // Verify parent owns this student
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        students: {
          where: { id: studentId },
        },
      },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    if (parent.students.length === 0) {
      throw new HttpException(
        'Bạn không có quyền xem thông tin học sinh này',
        HttpStatus.FORBIDDEN,
      );
    }

    // Get all enrollments with class details
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId: studentId,
        class: {
          status: 'active',
        },
      },
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            room: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            grade: {
              select: {
                name: true,
                level: true,
              },
            },
            sessions: {
              select: {
                id: true,
                sessionDate: true,
                startTime: true,
                endTime: true,
                status: true,
              },
              orderBy: {
                sessionDate: 'asc',
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // Transform data to frontend format
    const classes = enrollments.map((enrollment) => {
      const classData = enrollment.class;
      const totalSessions = classData.sessions.length;
      const completedSessions = classData.sessions.filter(
        (s) => s.status === 'completed',
      ).length;
      const progress =
        totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      // Get actual schedule from ClassSessions (not from recurringSchedule)
      // Group sessions by day of week and time
      const scheduleMap = new Map();

      classData.sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...

        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const dayOfWeek = dayNames[dayIndex];

        const key = `${dayOfWeek}-${session.startTime}-${session.endTime}`;

        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, {
            dayOfWeek: dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
          });
        }
      });

      const schedule = Array.from(scheduleMap.values());

      return {
        id: classData.id,
        name: classData.name,
        classCode: classData.classCode || '',
        status: classData.status, // ready, active, completed
        progress: progress,
        currentStudents: classData['currentStudents'] || 0,
        maxStudents: classData['maxStudents'] || 0,
        description: classData.description || '',

        // Keep full objects for frontend
        teacher: classData.teacher ? {
          id: classData.teacher.id,
          user: {
            fullName: classData.teacher.user.fullName,
            email: classData.teacher.user.email,
          }
        } : null,

        room: classData.room ? {
          name: classData.room.name,
        } : null,

        subject: classData.subject ? {
          name: classData.subject.name,
          code: classData.subject['code'],
        } : null,

        grade: classData.grade ? {
          name: classData.grade.name,
          level: classData.grade.level,
        } : null,

        schedule: schedule,

        // Dates
        startDate: classData.actualStartDate || classData['expectedStartDate'],
        endDate: classData.actualEndDate || classData['expectedEndDate'],

        // Student info
        studentName: enrollment.student.user.fullName,
        enrolledAt: enrollment.enrolledAt,

        // Stats
        totalSessions: totalSessions,
        completedSessions: completedSessions,
      };
    });

    return classes;
  }

  /**
   * Lấy tất cả lớp học của tất cả con
   */
  async getAllChildrenClasses(parentUserId: string) {
    // Get parent with all students
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        students: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    // Get all enrollments for all students
    const studentIds = parent.students.map((s) => s.id);

    if (studentIds.length === 0) {
      return [];
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
        class: {
          status: 'active',
        },
      },
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            room: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
            grade: {
              select: {
                name: true,
                level: true,
              },
            },
            sessions: {
              select: {
                id: true,
                sessionDate: true,
                startTime: true,
                endTime: true,
                status: true,
              },
              orderBy: {
                sessionDate: 'asc',
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // Transform data
    const classes = enrollments.map((enrollment) => {
      const classData = enrollment.class;
      const totalSessions = classData.sessions.length;
      const completedSessions = classData.sessions.filter(
        (s) => s.status === 'completed',
      ).length;
      const progress =
        totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      // Get actual schedule from ClassSessions (not from recurringSchedule)
      // Group sessions by day of week and time
      const scheduleMap = new Map();

      classData.sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...

        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const dayOfWeek = dayNames[dayIndex];

        const key = `${dayOfWeek}-${session.startTime}-${session.endTime}`;

        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, {
            dayOfWeek: dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
          });
        }
      });

      const schedule = Array.from(scheduleMap.values());

      return {
        id: classData.id,
        name: classData.name,
        classCode: classData.classCode || '',
        status: classData.status, // ready, active, completed
        progress: progress,
        currentStudents: classData['currentStudents'] || 0,
        maxStudents: classData['maxStudents'] || 0,
        description: classData.description || '',

        // Keep full objects for frontend
        teacher: classData.teacher ? {
          id: classData.teacher.id,
          user: {
            fullName: classData.teacher.user.fullName,
            email: classData.teacher.user.email,
          }
        } : null,

        room: classData.room ? {
          name: classData.room.name,
        } : null,

        subject: classData.subject ? {
          name: classData.subject.name,
          code: classData.subject['code'],
        } : null,

        grade: classData.grade ? {
          name: classData.grade.name,
          level: classData.grade.level,
        } : null,

        schedule: schedule,

        // Dates
        startDate: classData.actualStartDate || classData['expectedStartDate'],
        endDate: classData.actualEndDate || classData['expectedEndDate'],

        // Student info
        studentName: enrollment.student.user.fullName,
        enrolledAt: enrollment.enrolledAt,

        // Stats
        totalSessions: totalSessions,
        completedSessions: completedSessions,
      };
    });

    return classes;
  }
}
