import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';
import {
  GetStudentLeaveRequestsQueryDto,
  ApproveRejectStudentLeaveRequestDto,
} from '../dto/student-leave-request/student-leave-request.dto';

@Injectable()
export class TeacherStudentLeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách đơn nghỉ học của học sinh trong các lớp mà giáo viên phụ trách
   */
  async getStudentLeaveRequests(
    teacherId: string,
    query: GetStudentLeaveRequestsQueryDto,
  ) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException(
        'ID giáo viên không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tìm teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new HttpException(
        'Không tìm thấy thông tin giáo viên',
        HttpStatus.NOT_FOUND,
      );
    }

    // Lấy danh sách lớp mà giáo viên phụ trách
    const teacherClasses = await this.prisma.class.findMany({
      where: { teacherId: teacherId },
      select: { id: true },
    });

    const classIds = teacherClasses.map((c) => c.id);

    if (classIds.length === 0) {
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

    // Build base where clause: chỉ lấy đơn có affectedSessions thuộc lớp của giáo viên
    const baseWhere: any = {
      requestType: 'student_leave',
      affectedSessions: {
        some: {
          session: {
            classId: query.classId || { in: classIds },
          },
        },
      },
    };

    // Clone for filtered data (respect status filter if any)
    const filteredWhere: any = { ...baseWhere };
    if (query.status) {
      filteredWhere.status = query.status;
    }

    if (query.search) {
      baseWhere.student = {
        user: {
          fullName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      };
      filteredWhere.student = baseWhere.student;
    }

    const [total, leaveRequests, pendingCount, approvedCount, rejectedCount, allCount] = await Promise.all([
      // total for current filtered status
      this.prisma.leaveRequest.count({ where: filteredWhere }),
      this.prisma.leaveRequest.findMany({
        where: filteredWhere,
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
              parent: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
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
      // counts for each status ignoring current status filter
      this.prisma.leaveRequest.count({
        where: { ...baseWhere, status: 'pending' },
      }),
      this.prisma.leaveRequest.count({
        where: { ...baseWhere, status: 'approved' },
      }),
      this.prisma.leaveRequest.count({
        where: { ...baseWhere, status: 'rejected' },
      }),
      // all across statuses
      this.prisma.leaveRequest.count({
        where: baseWhere,
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
        all: allCount,
      },
    };
  }

  /**
   * Lấy chi tiết đơn nghỉ học
   */
  async getStudentLeaveRequestById(teacherId: string, leaveRequestId: string) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException(
        'ID giáo viên không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn nghỉ học không hợp lệ',
        HttpStatus.BAD_REQUEST,
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
            parent: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
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

    // Verify teacher có quyền xem đơn này (phải là giáo viên của ít nhất 1 lớp bị ảnh hưởng)
    const teacherClassIds = await this.prisma.class.findMany({
      where: { teacherId: teacherId },
      select: { id: true },
    });

    const teacherClassIdList = teacherClassIds.map((c) => c.id);

    const hasPermission = leaveRequest.affectedSessions.some((session) =>
      teacherClassIdList.includes(session.session.classId),
    );

    if (!hasPermission) {
      throw new HttpException(
        'Không có quyền xem đơn này',
        HttpStatus.FORBIDDEN,
      );
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
   * Duyệt hoặc từ chối đơn nghỉ học
   */
  async approveOrRejectStudentLeaveRequest(
    teacherId: string,
    leaveRequestId: string,
    action: 'approve' | 'reject',
    dto: ApproveRejectStudentLeaveRequestDto,
  ) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException(
        'ID giáo viên không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn nghỉ học không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tìm teacher và get userId
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { userId: true },
    });

    if (!teacher) {
      throw new HttpException(
        'Không tìm thấy thông tin giáo viên',
        HttpStatus.NOT_FOUND,
      );
    }

    // Tìm leave request
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
                  },
                },
              },
            },
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

    if (leaveRequest.status !== 'pending') {
      throw new HttpException(
        'Chỉ có thể duyệt/từ chối đơn đang chờ duyệt',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify teacher có quyền (phải là giáo viên của ít nhất 1 lớp bị ảnh hưởng)
    const teacherClassIds = await this.prisma.class.findMany({
      where: { teacherId: teacherId },
      select: { id: true },
    });

    const teacherClassIdList = teacherClassIds.map((c) => c.id);

    const affectedSessionsByTeacher = leaveRequest.affectedSessions.filter(
      (session) => teacherClassIdList.includes(session.session.classId),
    );

    if (affectedSessionsByTeacher.length === 0) {
      throw new HttpException(
        'Không có quyền duyệt đơn này',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update leave request status
    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: teacher.userId,
        approvedAt: new Date(),
        notes: dto.notes || leaveRequest.notes,
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
        approvedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Nếu approve, cập nhật attendance status thành "excused" (Có phép)
    if (action === 'approve') {
      const affectedSessionIds = leaveRequest.affectedSessions.map(
        (s) => s.sessionId,
      );

      // Tìm hoặc tạo attendance records và update status
      for (const sessionId of affectedSessionIds) {
        // Kiểm tra xem attendance record đã tồn tại chưa
        const existingAttendance =
          await this.prisma.studentSessionAttendance.findFirst({
            where: {
              studentId: leaveRequest.studentId,
              sessionId: sessionId,
            },
          });

        if (existingAttendance) {
          // Update existing
          await this.prisma.studentSessionAttendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: 'excused',
              note: `Nghỉ có phép - Đơn #${leaveRequestId.slice(0, 8)} đã được duyệt`,
            },
          });
        } else {
          // Create new attendance record
          await this.prisma.studentSessionAttendance.create({
            data: {
              studentId: leaveRequest.studentId,
              sessionId: sessionId,
              status: 'excused',
              note: `Nghỉ có phép - Đơn #${leaveRequestId.slice(0, 8)} đã được duyệt`,
              recordedBy: teacherId,
              recordedAt: new Date(),
            },
          });
        }
      }
    }

    // Get all affected classes
    const affectedClasses = new Map();

    for (const affectedSession of updatedRequest.affectedSessions) {
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
      ...updatedRequest,
      classes: Array.from(affectedClasses.values()),
    };
  }
}

