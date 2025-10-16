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
          enrollments: enrollmentWhere === undefined ? {
            include: {
              class: { include: { subject: true } },
              teacherClassAssignment: { include: { teacher: { include: { user: true } } } },
            },
          } : { where: enrollmentWhere, include: { class: { include: { subject: true } }, teacherClassAssignment: { include: { teacher: { include: { user: true } } } } } },
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
          teacher: e.teacherClassAssignment?.teacher
            ? { id: e.teacherClassAssignment.teacher.id, user: { fullName: e.teacherClassAssignment.teacher.user.fullName ?? '' } }
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
            class: { include: { subject: true } },
            teacherClassAssignment: { include: { teacher: { include: { user: true } } } },
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
          teacher: e.teacherClassAssignment?.teacher
            ? { id: e.teacherClassAssignment.teacher.id, user: { fullName: e.teacherClassAssignment.teacher.user.fullName ?? '' } }
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

  async getChildGradesForParent(userId: string, childId: string, subject?: string) {
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

    // Lấy điểm số của học sinh
    const grades = await this.prisma.studentAssessmentGrade.findMany({
      where: {
        studentId: childId,
        ...(subject ? {
          assessment: {
            class: {
              subject: {
                name: {
                  contains: subject,
                  mode: 'insensitive'
                }
              }
            }
          }
        } : {})
      },
      include: {
        assessment: {
          include: {
            class: {
              include: {
                subject: true,
                teacherClassAssignments: {
                  where: { status: 'active' },
                  include: {
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
      const teacherAssignment = grade.assessment.class.teacherClassAssignments[0];
      const teacherName = teacherAssignment?.teacher?.user?.fullName || 'Chưa xác định';
      
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
        className: grade.assessment.class.name
      };
    });

    return { data: result, message: 'Lấy điểm số thành công' };
  }
}
