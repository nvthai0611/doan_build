import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  QueryScheduleDto,
  QueryScheduleMonthDto,
  QueryScheduleWeekDto,
} from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

@Injectable()
export class ScheduleManagementService {
  constructor(
    private prisma: PrismaService,
    private emailNotificationService: EmailNotificationService,
  ) {}

  private mapSessionToClientShape(session: any) {
    return {
      id: session.id,
      classId: session.class?.id || '',
      teacherId: session.class?.teacher?.id || '',
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
            id: true,
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                id: true,
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
            id: true,
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                id: true,
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
            id: true,
            name: true,
            maxStudents: true,
            subject: { select: { name: true } },
            teacher: {
              select: {
                id: true,
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
        substituteTeacher: {
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

    // Xác định có phải giáo viên dạy thay không
    const isSubstitute =
      session.substituteTeacherId &&
      session.substituteEndDate &&
      new Date(session.substituteEndDate) >= session.sessionDate;

    // Lấy thông tin giáo viên chính
    // Khi có dạy thay: session.teacher là giáo viên chính (gốc), session.substituteTeacher là giáo viên dạy thay
    // Khi không có dạy thay: session.teacher là giáo viên phụ trách
    const originalTeacher = isSubstitute ? session.teacher : null;

    // Tìm TeacherClassTransfer để lấy substituteStartDate (effectiveDate)
    let substituteStartDate: Date | null = null;
    if (isSubstitute && session.substituteTeacherId && session.classId) {
      const transfer = await this.prisma.teacherClassTransfer.findFirst({
        where: {
          fromClassId: session.classId,
          replacementTeacherId: session.substituteTeacherId,
          substituteEndDate: {
            not: null,
            gte: session.sessionDate,
          },
          effectiveDate: { lte: session.sessionDate },
          status: { in: ['approved', 'completed'] },
        },
        select: {
          effectiveDate: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      });
      if (transfer) {
        substituteStartDate = transfer.effectiveDate;
      }
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
      teacher: isSubstitute ? session.substituteTeacher : session.teacher,
      originalTeacher: isSubstitute ? originalTeacher : null,
      substituteTeacher: isSubstitute ? session.substituteTeacher : null,
      isSubstitute: isSubstitute,
      substituteTeacherId: session.substituteTeacherId,
      substituteEndDate: session.substituteEndDate,
      substituteStartDate: substituteStartDate,
      attendanceCount: session.attendances.length,
    };
  }

  /**
   * Lấy danh sách điểm danh của buổi học (bao gồm tất cả học sinh, kể cả chưa điểm danh)
   */
  async getSessionAttendance(sessionId: string) {
    // Kiểm tra buổi học có tồn tại không
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true, sessionDate: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Chuẩn hóa sessionDate về UTC midnight để so sánh với enrolledAt
    const sessionDateMidnight = new Date(
      Date.UTC(
        session.sessionDate.getUTCFullYear(),
        session.sessionDate.getUTCMonth(),
        session.sessionDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Lấy tất cả học sinh đang học trong lớp và đã enroll trước hoặc vào ngày buổi học
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: session.classId,
        status: 'studying',
        enrolledAt: {
          lte: sessionDateMidnight, // Chỉ lấy học sinh đã enroll trước hoặc vào ngày buổi học
        },
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
      },
      orderBy: {
        student: {
          user: {
            fullName: 'asc',
          },
        },
      },
    });

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // Lấy danh sách attendance đã có (nếu có)
    const attendancesMap = new Map();
    const existingAttendances =
      await this.prisma.studentSessionAttendance.findMany({
        where: {
          sessionId: sessionId,
        },
        include: {
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
      });

    // Tạo map để dễ lookup
    existingAttendances.forEach((attendance) => {
      attendancesMap.set(attendance.studentId, attendance);
    });

    // Map tất cả học sinh, kể cả chưa điểm danh
    return enrollments.map((enrollment) => {
      const attendance = attendancesMap.get(enrollment.studentId);

      if (attendance) {
        // Học sinh đã điểm danh
        return {
          id: attendance.id.toString(),
          sessionId: attendance.sessionId,
          studentId: enrollment.studentId,
          studentName: enrollment.student.user.fullName,
          studentCode: enrollment.student.studentCode,
          status: attendance.status, // present, absent, late, not_attended
          checkInTime: attendance.recordedAt,
          checkOutTime: null,
          note: attendance.note,
          recordedBy: attendance.recordedByTeacher?.user?.fullName,
          recordedAt: attendance.recordedAt,
          isSent: attendance.isSent,
          sentAt: attendance.sentAt,
          student: {
            id: enrollment.student.id,
            studentCode: enrollment.student.studentCode,
            user: enrollment.student.user,
          },
          thaiDoHoc: null,
          kyNangLamViecNhom: null,
        };
      } else {
        // Học sinh chưa điểm danh
        return {
          id: null,
          sessionId: sessionId,
          studentId: enrollment.studentId,
          studentName: enrollment.student.user.fullName,
          studentCode: enrollment.student.studentCode,
          status: null,
          checkInTime: null,
          checkOutTime: null,
          note: null,
          recordedBy: null,
          recordedAt: null,
          isSent: false,
          sentAt: null,
          student: {
            id: enrollment.student.id,
            studentCode: enrollment.student.studentCode,
            user: enrollment.student.user,
          },
          thaiDoHoc: null,
          kyNangLamViecNhom: null,
        };
      }
    });
  }

  /**
   * Điểm danh học sinh (tạo mới hoặc cập nhật nếu đã có)
   */
  async recordAttendance(
    sessionId: string,
    studentId: string,
    status: string,
    recordedBy: string,
    note?: string,
  ) {
    // Kiểm tra buổi học có tồn tại không
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true, sessionDate: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Chuẩn hóa sessionDate về UTC midnight để so sánh với enrolledAt
    const sessionDateMidnight = new Date(
      Date.UTC(
        session.sessionDate.getUTCFullYear(),
        session.sessionDate.getUTCMonth(),
        session.sessionDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Kiểm tra học sinh có trong lớp không và đã enroll trước hoặc vào ngày buổi học
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId: studentId,
        status: 'studying',
        enrolledAt: {
          lte: sessionDateMidnight, // Chỉ cho phép điểm danh học sinh đã enroll trước hoặc vào ngày buổi học
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'Học sinh không thuộc lớp này hoặc chưa enroll vào thời điểm buổi học',
      );
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'excused'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Status không hợp lệ. Phải là một trong: ${validStatuses.join(', ')}`,
      );
    }

    // Upsert attendance (tạo mới hoặc cập nhật)
    const attendance = await this.prisma.studentSessionAttendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: studentId,
        },
      },
      update: {
        status: status,
        note: note || null,
        recordedBy: recordedBy,
        recordedAt: new Date(),
        isSent: false, // Reset isSent khi cập nhật lại
        sentAt: null,
      },
      create: {
        sessionId: sessionId,
        studentId: studentId,
        status: status,
        note: note || null,
        recordedBy: recordedBy,
        recordedAt: new Date(),
        isSent: false,
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
    });

    // Map to frontend format
    return {
      id: attendance.id.toString(),
      sessionId: attendance.sessionId,
      studentId: attendance.studentId,
      studentName: attendance.student.user.fullName,
      studentCode: attendance.student.studentCode,
      status: attendance.status,
      checkInTime: attendance.recordedAt,
      checkOutTime: null,
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
      thaiDoHoc: null,
      kyNangLamViecNhom: null,
    };
  }

  /**
   * Cập nhật buổi học
   */
  async updateSession(sessionId: string, body: any) {
    // Lấy thông tin session cũ trước khi update
    const oldSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        sessionDate: true,
        startTime: true,
        endTime: true,
        status: true,
        cancellationReason: true,
      },
    });

    if (!oldSession) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Chuẩn hóa dữ liệu update
    const updateData: any = { ...body };

    // Chuẩn hóa sessionDate thành UTC midnight
    if (body.sessionDate) {
      if (typeof body.sessionDate === 'string') {
        const [year, month, day] = body.sessionDate.split('-').map(Number);
        updateData.sessionDate = new Date(
          Date.UTC(year, month - 1, day, 0, 0, 0, 0),
        );
      } else if (body.sessionDate instanceof Date) {
        // Đảm bảo đưa về UTC midnight
        updateData.sessionDate = new Date(
          Date.UTC(
            body.sessionDate.getUTCFullYear(),
            body.sessionDate.getUTCMonth(),
            body.sessionDate.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      } else {
        const parsed = new Date(body.sessionDate);
        updateData.sessionDate = new Date(
          Date.UTC(
            parsed.getUTCFullYear(),
            parsed.getUTCMonth(),
            parsed.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      }
    }

    // Xác định thông tin dùng để check conflict trước khi update
    const hasDateTimeChanges =
      body.sessionDate !== undefined ||
      body.startTime !== undefined ||
      body.endTime !== undefined;

    if (hasDateTimeChanges) {
      const targetDateStr = (() => {
        if (typeof body.sessionDate === 'string') {
          return body.sessionDate;
        }
        if (body.sessionDate instanceof Date) {
          return body.sessionDate.toISOString().split('T')[0];
        }
        if (body.sessionDate) {
          return new Date(body.sessionDate).toISOString().split('T')[0];
        }
        if (oldSession.sessionDate instanceof Date) {
          return oldSession.sessionDate.toISOString().split('T')[0];
        }
        return new Date(oldSession.sessionDate as any)
          .toISOString()
          .split('T')[0];
      })();

      const finalStartTime = body.startTime || oldSession.startTime;
      const finalEndTime = body.endTime || oldSession.endTime;

      if (!finalStartTime || !finalEndTime) {
        throw new BadRequestException(
          'Thiếu giờ bắt đầu hoặc giờ kết thúc để kiểm tra trùng lịch.',
        );
      }

      const conflictResult = await this.checkScheduleConflict(
        sessionId,
        targetDateStr,
        finalStartTime,
        finalEndTime,
      );

      if (conflictResult.hasConflict) {
        throw new BadRequestException({
          success: false,
          error: 'SCHEDULE_CONFLICT',
          message: 'Lịch học bị trùng, vui lòng chọn khung giờ khác.',
          conflicts: conflictResult.conflicts,
        });
      }
    }

    // Update session
    const session = await this.prisma.classSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    // Kiểm tra thay đổi và gửi email
    try {
      // Format old date
      const oldDate = oldSession.sessionDate
        ? oldSession.sessionDate instanceof Date
          ? oldSession.sessionDate.toISOString().split('T')[0]
          : new Date(oldSession.sessionDate).toISOString().split('T')[0]
        : '';

      // Format old time
      const oldTime =
        oldSession.startTime && oldSession.endTime
          ? `${oldSession.startTime} - ${oldSession.endTime}`
          : '';

      // Format new date
      let newDate = oldDate;
      if (updateData.sessionDate) {
        if (updateData.sessionDate instanceof Date) {
          newDate = updateData.sessionDate.toISOString().split('T')[0];
        } else if (typeof updateData.sessionDate === 'string') {
          newDate = updateData.sessionDate.split('T')[0];
        } else {
          newDate = new Date(updateData.sessionDate)
            .toISOString()
            .split('T')[0];
        }
      }

      // Format new time
      let newTime = oldTime;
      if (updateData.startTime || updateData.endTime) {
        const finalStartTime =
          updateData.startTime || oldSession.startTime || '';
        const finalEndTime = updateData.endTime || oldSession.endTime || '';
        if (finalStartTime && finalEndTime) {
          newTime = `${finalStartTime} - ${finalEndTime}`;
        }
      }

      // Kiểm tra nếu hủy buổi học (status = day_off)
      if (updateData.status === 'day_off' && oldSession.status !== 'day_off') {
        await this.emailNotificationService.sendSessionChangeEmail(
          sessionId,
          'cancelled',
          oldDate,
          oldTime,
          undefined,
          undefined,
          body.cancellationReason ||
            oldSession.cancellationReason ||
            'Không có lý do',
        );
      }
      // Kiểm tra nếu thay đổi thời gian hoặc ngày
      else if (
        (updateData.sessionDate && oldDate !== newDate) ||
        (updateData.startTime &&
          oldSession.startTime !== updateData.startTime) ||
        (updateData.endTime && oldSession.endTime !== updateData.endTime)
      ) {
        await this.emailNotificationService.sendSessionChangeEmail(
          sessionId,
          'rescheduled',
          oldDate,
          oldTime,
          newDate,
          newTime,
          updateData.reason || '',
        );
      }
    } catch (emailError) {
      // Log lỗi nhưng không throw - vì session đã được update thành công
      console.error('Lỗi khi gửi email thông báo thay đổi lịch:', emailError);
    }

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
      select: { roomId: true, sessionDate: true, teacherId: true },
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

    // Tìm các buổi học khác trong cùng ngày có xung đột về phòng HOẶC giáo viên
    const conflictingSessions = await this.prisma.classSession.findMany({
      where: {
        id: { not: sessionId }, // Loại trừ buổi học hiện tại
        sessionDate: targetDate,
        status: { notIn: ['cancelled', 'end', 'day_off'] }, // Chỉ check các buổi chưa hủy/chưa kết thúc
        class: {
          status: { in: ['active'] },
        },
        OR: [
          // Xung đột phòng học: cùng phòng, cùng ngày
          {
            roomId: currentSession.roomId,
          },
          // Xung đột giáo viên: cùng giáo viên, cùng ngày (kể cả khác lớp, khác phòng)
          {
            teacherId: currentSession.teacherId,
          },
        ],
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
      const [startYear, startMonth, startDay] = startDate
        .split('-')
        .map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      console.log(startYear, startMonth, startDay);
      // Tạo date ở UTC midnight
      dateStart = new Date(startDate);
      dateEnd = new Date(endDate);
      console.log(dateStart, dateEnd);
    } else {
      // Mặc định là hôm nay
      const today = new Date();
      dateStart = new Date(today.toISOString().split('T')[0]);
      dateEnd = new Date(today.toISOString().split('T')[0]);
    }

    // Build where condition
    const where: any = {
      sessionDate: {
        in: [dateStart, dateEnd],
      },
      // Chỉ lấy buổi học có giáo viên
      teacherId: { not: null },
      class: {
        status: { in: ['active'] },
      },
    };

    // Filter theo sessionStatus nếu có, nếu không thì loại trừ 'end' và 'cancelled'
    if (sessionStatus) {
      where.status = sessionStatus;
    } else {
      // Loại trừ các buổi đã kết thúc hoặc bị hủy
      where.status = { notIn: ['cancelled'] };
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
      sessions.map(async (session) => {
        // Chuẩn hóa sessionDate về UTC midnight để so sánh với enrolledAt
        const sessionDateMidnight = new Date(
          Date.UTC(
            session.sessionDate.getUTCFullYear(),
            session.sessionDate.getUTCMonth(),
            session.sessionDate.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        );
        return await this.prisma.enrollment.count({
          where: {
            classId: session.classId,
            status: { in: ['studying', 'not_been_updated'] },
            enrolledAt: { lte: sessionDateMidnight },
          },
        });
      }),
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

  /**
   * Cập nhật điểm danh của học sinh (cho phép sửa điểm danh quá khứ)
   */
  async updateStudentAttendance(
    sessionId: string,
    studentId: string,
    data: {
      status: string;
      note?: string;
      recordedBy?: string;
    },
  ) {
    // Kiểm tra buổi học tồn tại
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true, sessionDate: true, teacherId: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Kiểm tra học sinh có trong lớp không
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId: studentId,
        status: { in: ['studying', 'graduated'] },
      },
    });

    if (!enrollment) {
      throw new BadRequestException('Học sinh không thuộc lớp này');
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'excused'];
    if (!validStatuses.includes(data.status)) {
      throw new BadRequestException(
        `Status không hợp lệ. Phải là một trong: ${validStatuses.join(', ')}`,
      );
    }

    // Xác định recordedBy: ưu tiên từ request, sau đó từ session, cuối cùng fallback
    const recordedBy = data.recordedBy || session.teacherId || studentId;

    // Upsert attendance (tạo mới hoặc cập nhật)
    const attendance = await this.prisma.studentSessionAttendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: studentId,
        },
      },
      update: {
        status: data.status,
        note: data.note || null,
        recordedBy: recordedBy,
        recordedAt: new Date(),
        isSent: false, // Reset isSent khi cập nhật lại
        sentAt: null,
      },
      create: {
        sessionId: sessionId,
        studentId: studentId,
        status: data.status,
        note: data.note || null,
        recordedBy: recordedBy,
        recordedAt: new Date(),
        isSent: false,
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
    });

    return {
      id: attendance.id.toString(),
      sessionId: attendance.sessionId,
      studentId: attendance.studentId,
      studentName: attendance.student.user.fullName,
      studentCode: attendance.student.studentCode,
      status: attendance.status,
      checkInTime: attendance.recordedAt,
      checkOutTime: null,
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
      thaiDoHoc: null,
      kyNangLamViecNhom: null,
    };
  }

  /**
   * Cập nhật điểm danh hàng loạt
   */
  async updateBulkAttendance(
    sessionId: string,
    attendances: Array<{
      studentId: string;
      status: string;
      note?: string;
    }>,
  ) {
    // Kiểm tra buổi học tồn tại
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    // Cập nhật từng bản ghi điểm danh
    const results = await Promise.all(
      attendances.map((attendance) =>
        this.updateStudentAttendance(sessionId, attendance.studentId, {
          status: attendance.status,
          note: attendance.note,
        }),
      ),
    );

    return results;
  }
}
