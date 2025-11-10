import { Injectable, NotFoundException } from '@nestjs/common';
import {
  QueryScheduleDto,
  QueryScheduleMonthDto,
  QueryScheduleWeekDto,
} from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ScheduleManagementService {
  constructor(private prisma: PrismaService) {}

  private mapSessionToClientShape(session: any) {
    return {
      id: session.id,
      name: session.class?.name || '',
      date: session.sessionDate.toISOString().slice(0, 10),
      startTime: session.startTime,
      endTime: session.endTime,
      roomName: session.room?.name || null,
      teacherName: session.class?.teacher?.user?.fullName || '',
      subjectName: session.class?.subject?.name || '',
      studentCount:
        (session.class?._count && session.class._count.enrollments) || 0,
      maxStudents: session.class?.maxStudents ?? 0,
      status: session.status,
    };
  }

  async getScheduleByDay(queryDto: QueryScheduleDto) {
    const { date } = queryDto;
    if (!date) return [];
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: new Date(date),
        status: {
          notIn: ['end', 'cancelled'],
        },
        class: {
          status: {
            in: ['active', 'ready', 'suspended'],
          },
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        room: { select: { name: true } },
        class: {
          select: {
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    return sessions.map((s) => this.mapSessionToClientShape(s));
  }

  async getScheduleByWeek(queryDto: QueryScheduleWeekDto) {
    const { startDate, endDate } = queryDto;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // bao gồm cả endDate: dùng lte
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: { gte: start, lte: end },
        status: {
          notIn: ['end', 'cancelled'],
        },
        class: {
          status: {
            in: ['active', 'ready', 'suspended'],
          },
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      include: {
        room: { select: { name: true } },
        class: {
          select: {
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    return sessions.map((s) => this.mapSessionToClientShape(s));
  }

  async getScheduleByMonth(queryDto: QueryScheduleMonthDto) {
    const { month, year } = queryDto;
    const monthNum = Number(month);
    const yearNum = Number(year);
    const firstDay = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const firstDayNextMonth = new Date(Date.UTC(yearNum, monthNum, 1));
    // dùng lt next month để bao toàn bộ tháng
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: { gte: firstDay, lt: firstDayNextMonth },
        status: {
          notIn: ['end', 'cancelled'],
        },
        class: {
          status: {
            in: ['active', 'ready', 'suspended'],
          },
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      include: {
        room: { select: { name: true } },
        class: {
          select: {
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    return sessions.map((s) => this.mapSessionToClientShape(s));
  }

  /**
   * Lấy tất cả lịch của các lớp đang hoạt động/đang tuyển sinh/tạm dừng
   * Trả về các lớp kèm recurringSchedule của chúng để hiển thị pattern lịch học
   *
   * @param expectedStartDate - Ngày bắt đầu dự kiến của lớp mới. Nếu có, chỉ trả về lớp có overlap với khoảng thời gian [expectedStartDate, 31/05 năm sau]
   */
  async getAllActiveClassesWithSchedules(expectedStartDate?: string) {
    const classes = await this.prisma.class.findMany({
      where: {
        status: {
          in: ['active', 'ready', 'suspended'],
        },
        // Chỉ lấy lớp có recurringSchedule
        recurringSchedule: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        recurringSchedule: true,
        teacherId: true, // Thêm teacherId để frontend có thể filter
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true, // Thêm teacher.id
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        expectedStartDate: true,
        actualStartDate: true,
        actualEndDate: true,
      },
      orderBy: { name: 'asc' },
    });

    // Transform để trả về format phù hợp với frontend
    let result = classes.map((cls) => {
      const schedule = cls.recurringSchedule as any;
      return {
        classId: cls.id,
        className: cls.name,
        teacherId: cls.teacherId || cls.teacher?.id || null, // Thêm teacherId
        teacherName: cls.teacher?.user?.fullName || '',
        subjectName: cls.subject?.name || '',
        roomId: cls.room?.id || null,
        roomName: cls.room?.name || null,
        expectedStartDate: cls.expectedStartDate,
        actualStartDate: cls.actualStartDate,
        actualEndDate: cls.actualEndDate,
        schedules: schedule?.schedules || [], // Mảng các { day, startTime, endTime, roomId }
      };
    });

    // Filter các lớp có overlap với khoảng thời gian
    // Nếu có expectedStartDate: dùng expectedStartDate
    // Nếu không có: dùng ngày hiện tại
    let rangeStartDate: Date;
    if (expectedStartDate) {
      // Parse date string thành UTC date (format: YYYY-MM-DD)
      const [year, month, day] = expectedStartDate.split('-').map(Number);
      rangeStartDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else {
      // Dùng ngày hiện tại
      const now = new Date();
      rangeStartDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
    }

    // Tính ngày kết thúc: 31/05 năm sau
    const nextYear = rangeStartDate.getUTCFullYear() + 1;
    const rangeEndDate = new Date(Date.UTC(nextYear, 4, 31, 0, 0, 0, 0)); // Tháng 5 (index 4)

    result = result.filter((cls) => {
      // Lấy ngày bắt đầu của lớp (ưu tiên actualStartDate, nếu không có thì dùng expectedStartDate)
      const classStartRaw = cls.actualStartDate || cls.expectedStartDate;
      if (!classStartRaw) return false;

      const classStart = new Date(classStartRaw);
      const classStartDate = new Date(
        Date.UTC(
          classStart.getUTCFullYear(),
          classStart.getUTCMonth(),
          classStart.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      // Lấy ngày kết thúc của lớp
      let classEndDate: Date;
      if (cls.actualEndDate) {
        const classEnd = new Date(cls.actualEndDate);
        classEndDate = new Date(
          Date.UTC(
            classEnd.getUTCFullYear(),
            classEnd.getUTCMonth(),
            classEnd.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      } else {
        // Mặc định là 31/05 năm sau của classStart
        const classNextYear = classStartDate.getUTCFullYear() + 1;
        classEndDate = new Date(Date.UTC(classNextYear, 4, 31, 0, 0, 0, 0)); // Tháng 5 (index 4)
      }

      // Lớp có overlap nếu:
      // 1. Lớp chưa kết thúc trước khi khoảng thời gian bắt đầu: classEnd >= rangeStart
      // 2. Lớp chưa bắt đầu sau khi khoảng thời gian kết thúc: classStart <= rangeEnd

      // Nếu lớp đã kết thúc trước khi khoảng thời gian bắt đầu → loại bỏ
      if (classEndDate.getTime() < rangeStartDate.getTime()) {
        return false;
      }

      // Nếu lớp sẽ bắt đầu sau khi khoảng thời gian kết thúc → loại bỏ
      if (classStartDate.getTime() > rangeEndDate.getTime()) {
        return false;
      }

      // Các trường hợp còn lại đều có overlap
      return true;
    });

    return result;
  }

  /**
   * Lấy chi tiết buổi học theo ID
   */
  async getSessionById(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
            teacher: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        attendances: {
          select: {
            id: true,
            status: true,
            note: true,
            recordedAt: true,
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    return {
      id: session.id,
      name: session.notes || `Buổi ${session.academicYear}`,
      topic: session.notes,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      notes: session.notes,
      academicYear: session.academicYear,
      cancellationReason: session.cancellationReason,
      createdAt: session.createdAt,
      class: session.class,
      room: session.room,
      teacher: session.teacher,
      attendanceCount: session.attendances.length,
    };
  }

  /**
   * Lấy danh sách điểm danh của buổi học
   */
  async getSessionAttendance(sessionId: string) {
    // Kiểm tra buổi học có tồn tại không
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Lấy danh sách attendance từ StudentSessionAttendance
    const attendances = await this.prisma.studentSessionAttendance.findMany({
      where: {
        sessionId: sessionId,
      },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        recordedByTeacher: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            fullName: 'asc',
          },
        },
      },
    });

    // Map to frontend format
    return attendances.map((attendance) => ({
      id: attendance.id.toString(),
      sessionId: attendance.sessionId,
      studentId: attendance.studentId,
      studentName: attendance.student.user.fullName,
      studentCode: attendance.student.studentCode,
      status: attendance.status, // present, absent, late, not_attended
      checkInTime: attendance.recordedAt,
      checkOutTime: null, // Có thể bổ sung sau nếu cần
      note: attendance.note,
      recordedBy: attendance.recordedByTeacher?.user?.fullName,
      recordedAt: attendance.recordedAt,
      isSent: attendance.isSent,
      sentAt: attendance.sentAt,
      student: {
        id: attendance.student.id,
        studentCode: attendance.student.studentCode,
        user: attendance.student.user,
      },
      // Bổ sung các trường đánh giá (nếu có trong database)
      thaiDoHoc: null, // Có thể thêm vào StudentSessionAttendance model sau
      kyNangLamViecNhom: null, // Có thể thêm vào StudentSessionAttendance model sau
    }));
  }

  /**
   * Cập nhật buổi học
   */
  async updateSession(sessionId: string, body: any) {
    const session = await this.prisma.classSession.update({
      where: { id: sessionId },
      data: body,
    });
    return session;
  }

  /**
   * Kiểm tra xung đột lịch học tại phòng học
   * @param sessionId - ID của buổi học đang muốn cập nhật
   * @param sessionDate - Ngày của buổi học (YYYY-MM-DD)
   * @param startTime - Giờ bắt đầu (HH:mm)
   * @param endTime - Giờ kết thúc (HH:mm)
   * @returns Danh sách các buổi học bị trùng (nếu có)
   */
  async checkScheduleConflict(
    sessionId: string,
    sessionDate: string,
    startTime: string,
    endTime: string,
  ) {
    // Lấy thông tin buổi học hiện tại để lấy roomId
    const currentSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { roomId: true, sessionDate: true },
    });

    if (!currentSession) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Nếu không có phòng học, không cần check conflict
    if (!currentSession.roomId) {
      return { hasConflict: false, conflicts: [] };
    }

    // Parse sessionDate thành Date object (UTC)
    const [year, month, day] = sessionDate.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Parse time strings thành số phút từ đầu ngày để so sánh
    const parseTimeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMinutes = parseTimeToMinutes(startTime);
    const newEndMinutes = parseTimeToMinutes(endTime);

    // Tìm các buổi học khác tại cùng phòng, cùng ngày
    const conflictingSessions = await this.prisma.classSession.findMany({
      where: {
        id: { not: sessionId }, // Loại trừ buổi học hiện tại
        roomId: currentSession.roomId,
        sessionDate: targetDate,
        status: { notIn: ['cancelled', 'end'] }, // Chỉ check các buổi chưa hủy/chưa kết thúc
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        notes: true,
        class: {
          select: {
            name: true,
            classCode: true,
          },
        },
      },
    });

    // Kiểm tra xung đột theo logic time overlap
    // Hai khoảng thời gian [A1, A2] và [B1, B2] trùng nhau khi:
    // A1 < B2 && B1 < A2
    const conflicts = conflictingSessions.filter((session) => {
      const sessionStartMinutes = parseTimeToMinutes(session.startTime);
      const sessionEndMinutes = parseTimeToMinutes(session.endTime);

      return (
        newStartMinutes < sessionEndMinutes &&
        sessionStartMinutes < newEndMinutes
      );
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map((c) => ({
        id: c.id,
        className: c.class?.name || '',
        classCode: c.class?.classCode || '',
        notes: c.notes || '',
        startTime: c.startTime,
        endTime: c.endTime,
      })),
    };
  }

  /**
   * Lấy danh sách giáo viên tham gia buổi học theo ngày
   * Dùng cho trang "Buổi học hôm nay" của center-owner
   */
  async getTeachersInSessionsToday(query: any) {
    const {
      startDate,
      endDate,
      search,
      attendanceStatus,
      page = 1,
      limit = 10,
      classId,
      sessionStatus,
    } = query;

    // Convert page và limit sang number nếu là string
    const pageNum =
      typeof page === 'string' ? parseInt(page, 10) : Number(page);
    const limitNum =
      typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);

    // Xác định khoảng thời gian (mặc định là hôm nay nếu không có)
    let dateStart: Date;
    let dateEnd: Date;

    if (startDate && endDate) {
      // Parse date string - tạo date ở UTC để so sánh với @db.Date
      // Format: "yyyy-MM-dd"
      // @db.Date trong PostgreSQL chỉ lưu ngày, không có timezone
      // Nên cần tạo date ở UTC midnight để tránh lệch ngày
      const [startYear, startMonth, startDay] = startDate
        .split('-')
        .map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

      // Tạo date ở UTC midnight
      dateStart = new Date(
        Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0),
      );
      dateEnd = new Date(
        Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999),
      );
    } else {
      // Mặc định là hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateStart = today;
      dateEnd = new Date(today);
      dateEnd.setHours(23, 59, 59, 999);
    }

    // Build where condition
    const where: any = {
      sessionDate: {
        gte: dateStart,
        lte: dateEnd,
      },
      // Chỉ lấy buổi học có giáo viên
      teacherId: { not: null },
      class: {
        status: { in: ['active', 'ready', 'suspended'] },
      },
    };

    // Filter theo sessionStatus nếu có, nếu không thì loại trừ 'end' và 'cancelled'
    if (sessionStatus) {
      where.status = sessionStatus;
    } else {
      // Loại trừ các buổi đã kết thúc hoặc bị hủy
      where.status = { notIn: ['end', 'cancelled'] };
    }

    // Filter theo tên giáo viên nếu có search
    if (search) {
      where.teacher = {
        user: {
          fullName: { contains: search, mode: 'insensitive' },
        },
      };
    }

    // Filter theo classId nếu có
    if (classId) {
      where.classId = classId;
    }

    // Lấy tổng số trước
    const total = await this.prisma.classSession.count({ where });

    // Lấy danh sách sessions với pagination
    const skip = (pageNum - 1) * limitNum;
    const sessions = await this.prisma.classSession.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        substituteTeacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            subject: {
              select: {
                name: true,
              },
            },
            maxStudents: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        attendances: {
          select: {
            id: true,
            status: true,
          },
        },
        teacherSessionPayout: {
          select: {
            teacherPayout: true,
          },
        },
      },
    });

    // Đếm enrollment cho từng session dựa trên enrolledAt <= sessionDate
    const sessionEnrollmentCounts = await Promise.all(
      sessions.map((session) =>
        this.prisma.enrollment.count({
          where: {
            classId: session.classId,
            status: { in: ['studying', 'not_been_updated'] },
            enrolledAt: {
              lte: session.sessionDate, // Chỉ đếm những người đã enroll trước hoặc vào ngày của buổi học
            },
          },
        }),
      ),
    );

    const result = sessions.map((session, index) => {
      // Xác định vai trò: giáo viên chính hoặc giáo viên thay thế
      const isSubstitute =
        session.substituteTeacherId &&
        session.substituteEndDate &&
        new Date(session.substituteEndDate) >= session.sessionDate;
      const teacher = isSubstitute
        ? session.substituteTeacher
        : session.teacher;
      const role = isSubstitute ? 'GV thay thế' : 'Giáo Viên';

      return {
        id: session.id,
        stt: skip + index + 1,
        teacher: {
          id: teacher?.id || '',
          userId: teacher?.userId || '',
          fullName: teacher?.user?.fullName || 'Chưa có tên',
          avatar: teacher?.user?.avatar || null,
          teacherCode: teacher?.teacherCode || '',
          email: (teacher?.user as any)?.email || '',
        },
        role: role,
        session: {
          id: session.id,
          sessionNumber: session.notes?.match(/Buổi (\d+)/)?.[1] || '',
          status: session.status,
          sessionDate: session.sessionDate.toISOString().split('T')[0],
          startTime: session.startTime,
          endTime: session.endTime,
          dateTimeRange: `${session.sessionDate.toISOString().split('T')[0]} ${session.startTime} → ${session.endTime}`,
        },
        class: {
          id: session.class.id,
          name: session.class.name,
          classCode: session.class.classCode,
          subject: session.class.subject?.name || '',
        },
        enrollmentCount: sessionEnrollmentCounts[index],
      };
    });
    return {
      data: result,
      meta: {
        total: result.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.length / limitNum),
      },
    };
  }
}
