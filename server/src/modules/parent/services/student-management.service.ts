import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

interface GetChildrenQuery {
  search?: string;
  grade?: string;
  schoolId?: string;
  enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'all';
  page?: number;
  limit?: number;
}

@Injectable()
export class StudentManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getChildrenForParent(userId: string, query: GetChildrenQuery = {}) {
    // Find parent by userId
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      return { data: [], message: 'Không tìm thấy phụ huynh' };
    }

    const {
      search,
      grade,
      schoolId,
      enrollmentStatus = 'all',
      page = 1,
      limit = 10,
    } = query;

    const where: any = {
      parentId: parent.id,
    };

    if (grade) where.grade = grade;
    if (schoolId) where.schoolId = schoolId;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { studentCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by enrollment status if needed
    let enrollmentWhere: any | undefined = undefined;
    if (enrollmentStatus === 'enrolled') {
      enrollmentWhere = { status: 'active' };
    } else if (enrollmentStatus === 'not_enrolled') {
      enrollmentWhere = { none: {} };
    }

    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.max(1, limit);

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take,
        include: {
          user: true,
          school: true,
          // Chỉ lấy enrollment ACTIVE và lớp ACTIVE
          enrollments: {
            where: {
              status: 'active',
              class: { status: 'active' },
            },
            include: {
              class: {
                include: {
                  subject: true,
                  teacher: { include: { user: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      userId: s.userId,
      studentCode: s.studentCode ?? undefined,
      dateOfBirth: s.user.birthDate ? s.user.birthDate.toISOString() : undefined,
      gender: s.user.gender ?? undefined,
      address: s.address ?? undefined,
      grade: s.grade ?? undefined,
      school: {
        id: s.school.id,
        name: s.school.name,
        address: s.school.address ?? undefined,
        phone: s.school.phone ?? undefined,
      },
      user: {
        id: s.user.id,
        fullName: s.user.fullName ?? s.user.username,
        email: s.user.email,
        avatar: s.user.avatar ?? undefined,
        phone: s.user.phone ?? undefined,
      },
      enrollments: s.enrollments?.map((e: any) => ({
        id: String(e.id),
        classId: e.classId,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        class: {
          id: e.class.id,
          name: e.class.name,
          subject: { id: e.class.subject.id, name: e.class.subject.name },
          teacher: e.class.teacher
            ? { id: e.class.teacher.id, user: { fullName: e.class.teacher.user.fullName ?? '' } }
            : { id: '', user: { fullName: '' } },
        },
      })),
    }));

    const totalPages = Math.ceil(total / take);

    return {
      data: formatted,
      message: 'Lấy danh sách con thành công',
      meta: {
        page,
        limit: take,
        total,
        totalPages,
      },
    };
  }

  async getChildDetailForParent(userId: string, childId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      return { data: null, message: 'Không tìm thấy phụ huynh' };
    }

    const student = await this.prisma.student.findFirst({
      where: { id: childId, parentId: parent.id },
      include: {
        user: true,
        school: true,
        enrollments: {
          include: {
            class: { 
              include: { 
                subject: true,
                teacher: { include: { user: true } }
              } 
            },
          },
        },
        attendances: {
          include: {
            session: { include: { class: { include: { subject: true } } } },
          },
          orderBy: { recordedAt: 'desc' },
          take: 50,
        },
        grades: {
          include: {
            assessment: { include: { class: true } },
          },
          orderBy: { gradedAt: 'desc' },
          take: 50,
        },
        payments: {
          include: { feeRecord: { include: { feeStructure: true } } },
          orderBy: { paidAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!student) {
      return { data: null, message: 'Không tìm thấy học sinh' };
    }

    const result: any = {
      id: student.id,
      userId: student.userId,
      studentCode: student.studentCode ?? undefined,
      dateOfBirth: student.user.birthDate ? student.user.birthDate.toISOString() : undefined,
      gender: student.user.gender ?? undefined,
      address: student.address ?? undefined,
      grade: student.grade ?? undefined,
      school: {
        id: student.school.id,
        name: student.school.name,
        address: student.school.address ?? undefined,
        phone: student.school.phone ?? undefined,
      },
      user: {
        id: student.user.id,
        fullName: student.user.fullName ?? student.user.username,
        email: student.user.email,
        avatar: student.user.avatar ?? undefined,
        phone: student.user.phone ?? undefined,
      },
      enrollments: student.enrollments.map((e: any) => ({
        id: String(e.id),
        classId: e.classId,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        class: {
          id: e.class.id,
          name: e.class.name,
          subject: { id: e.class.subject.id, name: e.class.subject.name },
          teacher: e.class.teacher
            ? { id: e.class.teacher.id, user: { fullName: e.class.teacher.user.fullName ?? '' } }
            : { id: '', user: { fullName: '' } },
        },
      })),
      attendances: student.attendances.map((a: any) => ({
        id: String(a.id),
        sessionId: a.sessionId,
        status: a.status,
        note: a.note ?? undefined,
        session: {
          id: a.session.id,
          sessionDate: a.session.sessionDate.toISOString(),
          startTime: a.session.startTime,
          endTime: a.session.endTime,
          class: { name: a.session.class.name, subject: { name: a.session.class.subject.name } },
        },
      })),
      grades: student.grades.map((g: any) => ({
        id: String(g.id),
        assessmentId: g.assessmentId,
        score: g.score ? Number(g.score) : undefined,
        feedback: g.feedback ?? undefined,
        assessment: {
          name: g.assessment.name,
          type: g.assessment.type,
          maxScore: Number(g.assessment.maxScore),
          date: g.assessment.date.toISOString(),
          class: { name: g.assessment.class.name },
        },
      })),
      payments: student.payments.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        paidAt: p.paidAt.toISOString(),
        feeRecord: { feeStructure: { name: p.feeRecord.feeStructure.name } },
      })),
    };

    return { data: result, message: 'Lấy chi tiết học sinh thành công' };
  }

  async getChildMetricsForParent(userId: string, childId: string) {
    // Xác thực phụ huynh và học sinh
    const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) return { data: null, message: 'Không tìm thấy phụ huynh' };

    const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
    if (!child) return { data: null, message: 'Không tìm thấy học sinh' };

    // Lấy danh sách lớp đang học (active)
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: childId, status: 'active', class: { status: 'active' } },
      select: { classId: true },
    });
    const classIds = enrollments.map((e) => e.classId);
    if (classIds.length === 0) {
      return {
        data: { averageGrade: 0, classRank: null, totalStudents: 0, attendanceRate: 0 },
        message: 'Chưa có lớp học đang hoạt động',
      };
    }

    // Tính điểm trung bình của học sinh
    const studentGradeAgg = await this.prisma.studentAssessmentGrade.aggregate({
      _avg: { score: true },
      where: { studentId: childId, assessment: { classId: { in: classIds } }, score: { not: null } },
    });
    const averageGrade = studentGradeAgg._avg.score ? Number(studentGradeAgg._avg.score) : 0;

    // Xếp hạng: tính điểm TB cho tất cả học sinh trong các lớp này, sắp xếp và tìm vị trí
    const classmates = await this.prisma.studentAssessmentGrade.groupBy({
      by: ['studentId'],
      _avg: { score: true },
      where: { assessment: { classId: { in: classIds } }, score: { not: null } },
    });
    const sorted = classmates
      .map((c) => ({ studentId: c.studentId, avg: c._avg.score ? Number(c._avg.score) : 0 }))
      .sort((a, b) => b.avg - a.avg);
    const totalStudents = sorted.length;
    const classRank = Math.max(1, sorted.findIndex((s) => s.studentId === childId) + 1) || null;

    // Tỷ lệ điểm danh: present / total trong các lớp đang học
    const [attendanceTotal, attendancePresent] = await Promise.all([
      this.prisma.studentSessionAttendance.count({ where: { studentId: childId, session: { classId: { in: classIds } } } }),
      this.prisma.studentSessionAttendance.count({ where: { studentId: childId, status: 'present', session: { classId: { in: classIds } } } }),
    ]);
    const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

    return {
      data: { averageGrade, classRank, totalStudents, attendanceRate },
      message: 'Lấy thành tích học tập thành công',
    };
  }

  async getChildScheduleForParent(
    userId: string,
    childId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) return { data: [], message: 'Không tìm thấy phụ huynh' };

    // Xác thực child thuộc về parent
    const child = await this.prisma.student.findFirst({
      where: { id: childId, parentId: parent.id },
      select: { id: true },
    });
    if (!child) return { data: [], message: 'Không tìm thấy học sinh' };

    // Lấy các lớp mà học sinh đang theo học
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: childId, status: 'active' },
      select: { classId: true },
    });
    const classIds = enrollments.map((e) => e.classId);
    if (classIds.length === 0) return { data: [], message: 'Chưa có lịch học' };

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId: { in: classIds },
        ...(startDate || endDate ? { sessionDate: dateFilter } : {}),
        status: 'scheduled',
      },
      include: {
        class: { 
          include: { 
            subject: true,
            teacher: {
              include: {
                user: { select: { fullName: true } }
              }
            }
          } 
        },
        room: true,
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });

    const result = sessions.map((s) => ({
      id: s.id,
      classId: s.classId,
      sessionDate: s.sessionDate.toISOString(),
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room ? { id: s.room.id, name: s.room.name, capacity: s.room.capacity ?? 0 } : undefined,
      status: s.status,
      class: {
        id: s.class.id,
        name: s.class.name,
        subject: { id: s.class.subject.id, name: s.class.subject.name },
        teacher: s.class.teacher ? {
          id: s.class.teacher.id,
          fullName: s.class.teacher.user?.fullName || null,
        } : undefined,
        maxStudents: s.class.maxStudents ?? 0,
        currentStudents: 0,
      },
    }));

    return { data: result, message: 'Lấy lịch học thành công' };
  }

  async getChildGradesForParent(userId: string, childId: string, classId?: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      return { data: [], message: 'Không tìm thấy phụ huynh' };
    }

    // Xác thực child thuộc về parent
    const child = await this.prisma.student.findFirst({
      where: { id: childId, parentId: parent.id },
      select: { id: true },
    });

    if (!child) {
      return { data: [], message: 'Không tìm thấy học sinh' };
    }

    // Lấy điểm số của học sinh (lọc theo lớp nếu có)
    const grades = await this.prisma.studentAssessmentGrade.findMany({
      where: {
        studentId: childId,
        ...(classId ? { assessment: { classId } } : {})
      },
      include: {
        assessment: {
          include: {
            class: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        fullName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        gradedByUser: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        gradedAt: 'desc'
      }
    });

    const result = grades.map((grade) => {
      const teacherName = grade.assessment.class.teacher?.user?.fullName || 'Chưa xác định';
      
      // Tính trạng thái dựa trên điểm số
      let status = 'average';
      if (grade.score !== null) {
        const scoreValue = Number(grade.score);
        if (scoreValue >= 8.5) {
          status = 'excellent';
        } else if (scoreValue >= 7.0) {
          status = 'good';
        }
      }

      return {
        id: String(grade.id),
        subject: grade.assessment.class.subject.name,
        examName: grade.assessment.name,
        date: grade.assessment.date.toISOString().split('T')[0],
        score: grade.score ? Number(grade.score) : null,
        maxScore: Number(grade.assessment.maxScore),
        status: status,
        teacher: teacherName,
        feedback: grade.feedback || '',
        gradedAt: grade.gradedAt.toISOString(),
        assessmentType: grade.assessment.type,
        className: grade.assessment.class.name,
        classId: grade.assessment.classId
      };
    });

    return { data: result, message: 'Lấy điểm số thành công' };
  }

  async getChildAttendanceForParent(userId: string, childId: string, filters: { classId?: string; startDate?: string; endDate?: string } = {}) {
    // Xác thực parent-child relationship
    const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) {
      return { success: false, message: 'Không tìm thấy phụ huynh' };
    }

    const student = await this.prisma.student.findFirst({ 
      where: { id: childId, parentId: parent.id }, 
      select: { id: true } 
    });
    if (!student) {
      return { success: false, message: 'Không tìm thấy học sinh' };
    }

    // Lấy các lớp học sinh đang học
    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        studentId: student.id, 
        status: 'studying',
        ...(filters.classId ? { classId: filters.classId } : {})
      },
      select: { classId: true }
    });

    const classIds = enrollments.map(e => e.classId);
    if (classIds.length === 0) {
      return { success: true, data: [], message: 'Học sinh chưa có lớp học nào' };
    }

    // Lấy tất cả sessions của các lớp học sinh đang học
    const sessionWhere: any = {
      classId: { in: classIds }
    };

    if (filters.startDate || filters.endDate) {
      sessionWhere.sessionDate = {};
      if (filters.startDate) sessionWhere.sessionDate.gte = new Date(filters.startDate);
      if (filters.endDate) sessionWhere.sessionDate.lte = new Date(filters.endDate);
    }

    const sessions = await this.prisma.classSession.findMany({
      where: sessionWhere,
      include: {
        class: {
          include: {
            subject: { select: { name: true } },
            teacher: { 
              include: { 
                user: { select: { fullName: true } } 
              } 
            }
          }
        },
        room: { select: { name: true } },
        attendances: {
          where: { studentId: student.id },
          include: {
            recordedByTeacher: {
              include: {
                user: { select: { fullName: true } }
              }
            }
          }
        }
      },
      orderBy: {
        sessionDate: 'asc'
      }
    });

    const result = sessions.map((session) => {
      const attendance = session.attendances[0]; // Lấy attendance record nếu có
      return {
        id: session.id,
        sessionId: session.id,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        attendanceStatus: attendance?.status || null,
        attendanceRecordedAt: attendance?.recordedAt,
        attendanceRecordedBy: attendance?.recordedByTeacher?.user?.fullName,
        attendanceNote: attendance?.note,
        room: session.room,
        class: {
          name: session.class.name,
          subject: session.class.subject
        },
        teacher: session.class.teacher?.user?.fullName
      };
    });

    return { success: true, data: result, message: 'Lấy lịch sử điểm danh thành công' };
  }
}
