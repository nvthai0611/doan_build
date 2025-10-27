import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PublicClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecruitingClasses(query: {
    page: number;
    limit: number;
    subjectId?: string;
    gradeId?: string;
  }) {
    const { page, limit, subjectId, gradeId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { in: ['ready', 'active'] }, // Lớp sẵn sàng hoặc đang học
      // Chỉ hiển thị lớp có thông tin đầy đủ
      teacherId: { not: null },
      // subjectId is required in schema, no need to filter
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (gradeId) {
      where.gradeId = gradeId;
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
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
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  status: { in: ['studying', 'not_been_updated'] },
                },
              },
              classRequests: {
                where: {
                  status: 'pending',
                },
              },
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // ready trước, active sau
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.class.count({ where }),
    ]);

    const formattedClasses = classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      classCode: classItem.classCode,
      description: classItem.description,
      status: classItem.status,
      maxStudents: classItem.maxStudents,
      currentStudents: classItem._count.enrollments,
      pendingRequests: classItem._count.classRequests,
      subject: classItem.subject,
      grade: classItem.grade,
      teacher: classItem.teacher
        ? {
            id: classItem.teacher.id,
            fullName: classItem.teacher.user.fullName,
            avatar: classItem.teacher.user.avatar,
          }
        : null,
      recurringSchedule: classItem.recurringSchedule,
      expectedStartDate: classItem.expectedStartDate,
      actualStartDate: classItem.actualStartDate,
      actualEndDate: classItem.actualEndDate,
      requirePassword: !!classItem.password,
      createdAt: classItem.createdAt,
    }));

    return {
      success: true,
      data: formattedClasses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Lấy danh sách lớp đang tuyển sinh thành công',
    };
  }

  async getSubjects() {
    const subjects = await this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: subjects,
      message: 'Lấy danh sách môn học thành công',
    };
  }

  async getGrades() {
    const grades = await this.prisma.grade.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: grades,
      message: 'Lấy danh sách khối lớp thành công',
    };
  }
}

