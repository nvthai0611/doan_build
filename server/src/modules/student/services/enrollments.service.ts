import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getEnrollmentsOfStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        class: {
          include: {
            subject: true,
            room: true,
            teacherClassAssignments: {
              take: 1,
              orderBy: { startDate: 'desc' },
              include: {
                teacher: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    // Chuẩn hóa teacher ở cấp class
    return enrollments.map((e) => ({
      ...e,
      class: {
        ...e.class,
        teacher: e.class?.teacherClassAssignments?.[0]?.teacher || null,
      },
    }));
  }
}
