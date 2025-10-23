import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';
import {
  CreateStudentLeaveRequestDto,
  UpdateStudentLeaveRequestDto,
  GetStudentLeaveRequestsQueryDto,
  GetAffectedSessionsQueryDto,
} from '../dto/student-leave-request/student-leave-request.dto';

@Injectable()
export class StudentLeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách đơn nghỉ học của học sinh
   */
  async getStudentLeaveRequests(
    parentUserId: string,
    query: GetStudentLeaveRequestsQueryDto,
  ) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tìm parent từ userId
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        students: true,
      },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    const studentIds = parent.students.map((s) => s.id);

    if (studentIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page: query.page || 1,
          limit: query.limit || 10,
          totalPages: 0,
        },
      };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      studentId: query.studentId || { in: studentIds },
      requestType: 'student_leave', // Phân biệt với teacher leave
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.classId) {
      // Lấy sessions của lớp này
      const classSessionIds = await this.prisma.classSession.findMany({
        where: { classId: query.classId },
        select: { id: true },
      });

      const sessionIds = classSessionIds.map((s) => s.id);

      // Tìm leave requests có affected sessions thuộc lớp này
      where.affectedSessions = {
        some: {
          sessionId: { in: sessionIds },
        },
      };
    }

    const [total, leaveRequests, pendingCount, approvedCount, rejectedCount, cancelledCount, allCount] = await Promise.all([
      this.prisma.leaveRequest.count({ where }),
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          affectedSessions: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      subject: true,
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
                    },
                  },
                  room: true,
                },
              },
            },
          },
          approvedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.leaveRequest.count({
        where: { ...where, status: 'pending' },
      }),
      this.prisma.leaveRequest.count({
        where: { ...where, status: 'approved' },
      }),
      this.prisma.leaveRequest.count({
        where: { ...where, status: 'rejected' },
      }),
      this.prisma.leaveRequest.count({
        where: { ...where, status: 'cancelled' },
      }),
      this.prisma.leaveRequest.count({
        where,
      }),
    ]);

    // Get all classes for each request
    const data = leaveRequests.map((request) => {
      // Get all affected classes from affectedSessions
      const affectedClasses = new Map();
      
      for (const affectedSession of request.affectedSessions) {
        const classData = affectedSession?.session?.class;
        if (classData && !affectedClasses.has(classData.id)) {
          affectedClasses.set(classData.id, {
            id: classData.id,
            name: classData.name,
            subject: classData.subject,
            teacher: classData.teacher
              ? {
                  id: classData.teacher.id,
                  user: classData.teacher.user,
                }
              : null,
          });
        }
      }

      return {
        ...request,
        classes: Array.from(affectedClasses.values()),
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        cancelled: cancelledCount,
        all: allCount,
      },
    };
  }

  /**
   * Lấy chi tiết đơn nghỉ học
   */
  async getStudentLeaveRequestById(
    parentUserId: string,
    leaveRequestId: string,
  ) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn nghỉ học không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tìm parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: { students: true },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        student: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        affectedSessions: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    subject: true,
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
                  },
                },
                room: true,
              },
            },
          },
        },
        approvedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new HttpException(
        'Không tìm thấy đơn nghỉ học',
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra xem đơn có thuộc về con của parent này không
    const studentIds = parent.students.map((s) => s.id);
    if (!studentIds.includes(leaveRequest.studentId)) {
      throw new HttpException('Không có quyền truy cập', HttpStatus.FORBIDDEN);
    }

    // Get all affected classes from affectedSessions
    const affectedClasses = new Map();
    
    for (const affectedSession of leaveRequest.affectedSessions) {
      const classData = affectedSession?.session?.class;
      if (classData && !affectedClasses.has(classData.id)) {
        affectedClasses.set(classData.id, {
          id: classData.id,
          name: classData.name,
          subject: classData.subject,
          teacher: classData.teacher
            ? {
                id: classData.teacher.id,
                user: classData.teacher.user,
              }
            : null,
        });
      }
    }

    return {
      ...leaveRequest,
      classes: Array.from(affectedClasses.values()),
    };
  }

  /**
   * Tạo đơn nghỉ học mới
   */
  async createStudentLeaveRequest(
    parentUserId: string,
    dto: CreateStudentLeaveRequestDto,
  ) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate dates
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException(
        'Định dạng ngày không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (end < start) {
      throw new HttpException(
        'Ngày kết thúc phải sau ngày bắt đầu',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify parent owns student
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: { students: true },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    const studentIds = parent.students.map((s) => s.id);
    if (!studentIds.includes(dto.studentId)) {
      throw new HttpException(
        'Không có quyền tạo đơn cho học sinh này',
        HttpStatus.FORBIDDEN,
      );
    }

    // Get all classes that student is enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId: dto.studentId,
        // Tạm thời bỏ điều kiện status để test
        // TODO: Uncomment dòng này khi đã có data đúng
        // status: 'approved',
      },
      select: {
        classId: true,
      },
    });

    if (enrollments.length === 0) {
      throw new HttpException(
        'Học sinh chưa ghi danh vào lớp học nào',
        HttpStatus.BAD_REQUEST,
      );
    }

    const classIds = enrollments.map((e) => e.classId);

    // Get affected sessions from ALL enrolled classes in date range
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId: { in: classIds },
        sessionDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
      },
    });

    // Create leave request with affected sessions (chỉ pending; không auto-approve)
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        requestType: 'student_leave',
        studentId: dto.studentId,
        startDate: start,
        endDate: end,
        reason: dto.reason,
        status: 'pending',
        createdBy: parentUserId,
        notes: null,
        approvedAt: null,
        affectedSessions: {
          create: sessions.map((session) => ({
            sessionId: session.id,
          })),
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        affectedSessions: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    subject: true,
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
                  },
                },
                room: true,
              },
            },
          },
        },
      },
    });

    // Get all affected classes from affectedSessions
    const affectedClasses = new Map();
    
    for (const affectedSession of leaveRequest.affectedSessions) {
      const classData = affectedSession?.session?.class;
      if (classData && !affectedClasses.has(classData.id)) {
        affectedClasses.set(classData.id, {
          id: classData.id,
          name: classData.name,
          subject: classData.subject,
          teacher: classData.teacher
            ? {
                id: classData.teacher.id,
                user: classData.teacher.user,
              }
            : null,
        });
      }
    }

    return {
      ...leaveRequest,
      classes: Array.from(affectedClasses.values()),
    };
  }

  /**
   * Cập nhật đơn nghỉ học (chỉ khi status = pending)
   */
  async updateStudentLeaveRequest(
    parentUserId: string,
    leaveRequestId: string,
    dto: UpdateStudentLeaveRequestDto,
  ) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn nghỉ học không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find and verify ownership
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        affectedSessions: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new HttpException(
        'Không tìm thấy đơn nghỉ học',
        HttpStatus.NOT_FOUND,
      );
    }

    if (leaveRequest.student.parent.userId !== parentUserId) {
      throw new HttpException('Không có quyền sửa đơn này', HttpStatus.FORBIDDEN);
    }

    if (leaveRequest.status !== 'pending') {
      throw new HttpException(
        'Chỉ có thể sửa đơn đang chờ duyệt',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get all classes that student is enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId: leaveRequest.studentId,
      },
      select: {
        classId: true,
      },
    });

    if (enrollments.length === 0) {
      throw new HttpException(
        'Học sinh chưa ghi danh vào lớp học nào',
        HttpStatus.BAD_REQUEST,
      );
    }

    const classIds = enrollments.map((e) => e.classId);

    // Determine dates to use (new or existing)
    const newStartDate = dto.startDate ? new Date(dto.startDate) : leaveRequest.startDate;
    const newEndDate = dto.endDate ? new Date(dto.endDate) : leaveRequest.endDate;

    // Validate dates
    if (newEndDate < newStartDate) {
      throw new HttpException(
        'Ngày kết thúc phải sau ngày bắt đầu',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if dates changed (normalize to date only, ignore time)
    const oldStartDateStr = leaveRequest.startDate.toISOString().split('T')[0];
    const oldEndDateStr = leaveRequest.endDate.toISOString().split('T')[0];
    const newStartDateStr = newStartDate.toISOString().split('T')[0];
    const newEndDateStr = newEndDate.toISOString().split('T')[0];
    
    const datesChanged = 
      oldStartDateStr !== newStartDateStr || 
      oldEndDateStr !== newEndDateStr;

    // If dates changed, update affected sessions
    if (datesChanged) {
      // Delete old affected sessions
      await this.prisma.leaveRequestAffectedSession.deleteMany({
        where: { leaveRequestId },
      });

      // Get new affected sessions from ALL enrolled classes
      const newSessions = await this.prisma.classSession.findMany({
        where: {
          classId: { in: classIds },
          sessionDate: {
            gte: newStartDate,
            lte: newEndDate,
          },
        },
        select: {
          id: true,
        },
      });

      // Update leave request with new dates, reason, and affected sessions
      const updated = await this.prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          startDate: newStartDate,
          endDate: newEndDate,
          reason: dto.reason || leaveRequest.reason,
          affectedSessions: {
            create: newSessions.map((session) => ({
              sessionId: session.id,
            })),
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          affectedSessions: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      subject: true,
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
                    },
                  },
                  room: true,
                },
              },
            },
          },
        },
      });

      // Get all affected classes from affectedSessions
      const affectedClasses = new Map();
      
      for (const affectedSession of updated.affectedSessions) {
        const classData = affectedSession?.session?.class;
        if (classData && !affectedClasses.has(classData.id)) {
          affectedClasses.set(classData.id, {
            id: classData.id,
            name: classData.name,
            subject: classData.subject,
            teacher: classData.teacher
              ? {
                  id: classData.teacher.id,
                  user: classData.teacher.user,
                }
              : null,
          });
        }
      }
      
      return {
        ...updated,
        classes: Array.from(affectedClasses.values()),
      };
    } else {
      // Only update reason if dates didn't change
      const updated = await this.prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          reason: dto.reason || leaveRequest.reason,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          affectedSessions: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      subject: true,
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
                    },
                  },
                  room: true,
                },
              },
            },
          },
        },
      });

      // Get all affected classes from affectedSessions
      const affectedClasses = new Map();
      
      for (const affectedSession of updated.affectedSessions) {
        const classData = affectedSession?.session?.class;
        if (classData && !affectedClasses.has(classData.id)) {
          affectedClasses.set(classData.id, {
            id: classData.id,
            name: classData.name,
            subject: classData.subject,
            teacher: classData.teacher
              ? {
                  id: classData.teacher.id,
                  user: classData.teacher.user,
                }
              : null,
          });
        }
      }
      
      return {
        ...updated,
        classes: Array.from(affectedClasses.values()),
      };
    }
  }

  /**
   * Hủy đơn nghỉ học (chỉ khi status = pending)
   */
  async cancelStudentLeaveRequest(
    parentUserId: string,
    leaveRequestId: string,
  ) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn nghỉ học không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find and verify ownership
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new HttpException(
        'Không tìm thấy đơn nghỉ học',
        HttpStatus.NOT_FOUND,
      );
    }

    if (leaveRequest.student.parent.userId !== parentUserId) {
      throw new HttpException('Không có quyền hủy đơn này', HttpStatus.FORBIDDEN);
    }

    if (leaveRequest.status !== 'pending') {
      throw new HttpException(
        'Chỉ có thể hủy đơn đang chờ duyệt',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: 'cancelled',
      },
    });

    return { success: true };
  }

  /**
   * Lấy danh sách lớp học của con
   */
  async getChildClasses(parentUserId: string, studentId: string) {
    if (!parentUserId || !checkId(parentUserId)) {
      throw new HttpException(
        'ID phụ huynh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!studentId || !checkId(studentId)) {
      throw new HttpException(
        'ID học sinh không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify ownership
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: { students: true },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    const studentIds = parent.students.map((s) => s.id);
    if (!studentIds.includes(studentId)) {
      throw new HttpException(
        'Không có quyền xem thông tin học sinh này',
        HttpStatus.FORBIDDEN,
      );
    }

    // Get enrolled classes
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        // Tạm thời bỏ điều kiện status để test
        // TODO: Uncomment dòng này khi đã có data đúng
        // status: 'approved',
      },
    });

    if (enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e) => e.classId);

    const classes = await this.prisma.class.findMany({
      where: {
        id: { in: classIds },
      },
      include: {
        subject: true,
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
        sessions: {
          select: {
            sessionDate: true,
            startTime: true,
            endTime: true,
          },
          take: 10, // Lấy 10 buổi gần nhất
          orderBy: {
            sessionDate: 'asc',
          },
        },
      },
    });

    return classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      subject: classItem.subject,
      teacher: classItem.teacher
        ? {
            id: classItem.teacher.id,
            user: classItem.teacher.user,
          }
        : null,
      schedule: classItem.sessions.map((s) => ({
        date: s.sessionDate.toISOString().slice(0, 10),
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    }));
  }

  /**
   * Lấy các buổi học bị ảnh hưởng từ TẤT CẢ các lớp của học sinh
   */
  async getAffectedSessions(query: GetAffectedSessionsQueryDto) {
    // Validate dates
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException(
        'Định dạng ngày không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (end < start) {
      throw new HttpException(
        'Ngày kết thúc phải sau ngày bắt đầu',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get all classes that student is enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId: query.studentId,
      },
      select: {
        classId: true,
      },
    });

    if (enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e) => e.classId);

    // Get sessions in date range for ALL enrolled classes
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId: { in: classIds },
        sessionDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        sessionDate: true,
        startTime: true,
        endTime: true,
        class: {
          select: {
            name: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });

    return sessions.map((s) => ({
      id: s.id,
      date: s.sessionDate.toISOString().slice(0, 10),
      time: `${s.startTime} - ${s.endTime}`,
      className: s.class?.name || '',
      subjectName: s.class?.subject?.name || '',
      room: s.room?.name || '',
    }));
  }
}

