import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PublicTeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeachers(params?: { subjectId?: string; limit?: number }) {
    const { subjectId, limit } = params || {};

    // Lọc theo subjectId nếu có (teacher.subjects là mảng string ID môn học)
    const where: any = {};
    if (subjectId) {
      where.subjects = { has: subjectId };
    }

    const teachers = await this.prisma.teacher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        subjects: true,
        user: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
        classes: {
          select: {
            status: true,
            name: true,
            classCode: true,
            enrollments: {
              where: {
                status: { in: ['studying', 'not_been_updated'] },
                class: { status: { in: ['active', 'ready'] } },
              },
              select: { id: true },
            },
          },
        },
        feedbacks: {
          select: {
            rating: true,
          },
        },
      },
    });


    const now = new Date();
    const result = teachers.map((t) => {
      const students = t.classes.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);
      const rating = t.feedbacks.length
        ? Number(
            (
              t.feedbacks.reduce((s, f) => s + (f.rating || 0), 0) /
              (t.feedbacks.length || 1)
            ).toFixed(1),
          )
        : 0;
      const experience = Math.max(0, now.getFullYear() - t.createdAt.getFullYear());

      // Nếu có nhiều môn -> hiển thị "Đa môn", nếu 1 môn thì lấy theo id (client có thể map thêm)
      const subjectLabel = t.subjects.length === 1 ? t.subjects[0] : t.subjects.length > 1 ? 'Đa môn' : 'Giáo viên';

      return {
        id: t.id,
        name: t.user.fullName || 'Giáo viên',
        subject: subjectLabel,
        subjects: t.subjects,
        experience,
        students,
        rating,
        avatar: t.user.avatar,
        classesStatus: t.classes.map(c => c.status),
        assignedClasses: t.classes.filter(c => c.status === 'active' || c.status === 'ready').map(c => ({
          className: c.name,
          classCode: c.classCode,
          status: c.status,
        })),
      };
    });

    return {
      success: true,
      data: result,
      message: 'Lấy danh sách giáo viên thành công',
    };
  }
}


