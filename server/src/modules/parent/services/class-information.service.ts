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
        status: 'studying', // Chỉ lấy lớp đang học
        class: {
          status: {
            in: ['ready', 'active'], // Bao gồm cả lớp ready và active
          },
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

    // Get class IDs to fetch active transfers
    const classIds = enrollments.map(e => e.class.id);
    
    // Fetch active teacher transfers for all classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeTransfers = await this.prisma.teacherClassTransfer.findMany({
      where: {
        fromClassId: { in: classIds },
        status: { in: ['approved', 'auto_created'] },
        effectiveDate: { lte: today },
        OR: [
          { substituteEndDate: null },
          { substituteEndDate: { gte: today } }
        ]
      },
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
        replacementTeacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    // Create map: classId -> active transfer
    const transferMap = new Map();
    activeTransfers.forEach(transfer => {
      if (!transferMap.has(transfer.fromClassId)) {
        transferMap.set(transfer.fromClassId, transfer);
      }
    });

    // Helper to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    };

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

      // Get active transfer for this class from TeacherClassTransfer
      const activeTransfer = transferMap.get(classData.id);

      // Determine primary teacher (original teacher)
      const activePrimaryTeacher = activeTransfer && activeTransfer.teacher
        ? {
            id: activeTransfer.teacher.id,
            fullName: activeTransfer.teacher.user?.fullName || null,
          }
        : classData.teacher
        ? {
            id: classData.teacher.id,
            fullName: classData.teacher.user?.fullName || null,
          }
        : null;

      // Determine substitute teacher from transfer
      const activeSubstituteTeacher = activeTransfer && activeTransfer.replacementTeacher
        ? {
            id: activeTransfer.replacementTeacher.id,
            fullName: activeTransfer.replacementTeacher.user?.fullName || null,
            from: activeTransfer.effectiveDate ? formatLocalDate(activeTransfer.effectiveDate as Date) : null,
            until: activeTransfer.substituteEndDate
              ? formatLocalDate(activeTransfer.substituteEndDate)
              : null,
          }
        : null;

      return {
        id: classData.id,
        name: classData.name,
        classCode: classData.classCode || '',
        status: classData.status, // ready, active
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
        activePrimaryTeacher: activePrimaryTeacher,
        activeSubstituteTeacher: activeSubstituteTeacher,

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
        status: 'studying', // Chỉ lấy lớp đang học
        class: {
          status: {
            in: ['ready', 'active'], // Bao gồm cả lớp ready và active
          },
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

    // Get class IDs to fetch active transfers
    const classIds = enrollments.map(e => e.class.id);
    
    // Fetch active teacher transfers for all classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeTransfers = await this.prisma.teacherClassTransfer.findMany({
      where: {
        fromClassId: { in: classIds },
        status: { in: ['approved', 'auto_created'] },
        effectiveDate: { lte: today },
        OR: [
          { substituteEndDate: null },
          { substituteEndDate: { gte: today } }
        ]
      },
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
        replacementTeacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    // Create map: classId -> active transfer
    const transferMap = new Map();
    activeTransfers.forEach(transfer => {
      if (!transferMap.has(transfer.fromClassId)) {
        transferMap.set(transfer.fromClassId, transfer);
      }
    });

    // Helper to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    };

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

      // Get active transfer for this class from TeacherClassTransfer
      const activeTransfer = transferMap.get(classData.id);

      // Determine primary teacher (original teacher)
      const activePrimaryTeacher = activeTransfer && activeTransfer.teacher
        ? {
            id: activeTransfer.teacher.id,
            fullName: activeTransfer.teacher.user?.fullName || null,
          }
        : classData.teacher
        ? {
            id: classData.teacher.id,
            fullName: classData.teacher.user?.fullName || null,
          }
        : null;

      // Determine substitute teacher from transfer
      const activeSubstituteTeacher = activeTransfer && activeTransfer.replacementTeacher
        ? {
            id: activeTransfer.replacementTeacher.id,
            fullName: activeTransfer.replacementTeacher.user?.fullName || null,
            from: activeTransfer.effectiveDate ? formatLocalDate(activeTransfer.effectiveDate as Date) : null,
            until: activeTransfer.substituteEndDate
              ? formatLocalDate(activeTransfer.substituteEndDate)
              : null,
          }
        : null;

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
        activePrimaryTeacher: activePrimaryTeacher,
        activeSubstituteTeacher: activeSubstituteTeacher,

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
