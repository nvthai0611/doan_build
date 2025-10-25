import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getEnrollmentsOfStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        studentId,
        class: {
          status: 'active' // Chỉ lấy lớp có trạng thái active
        }
      },
      orderBy: { enrolledAt: 'desc' },
      include: {
        class: {
          include: {
            subject: true,
            room: true,
            teacher: { include: { user: true } },
          },
        },
      },
    });

    // Chuẩn hóa teacher ở cấp class
    return enrollments.map((e) => ({
      ...e,
      class: {
        ...e.class,
        teacher: e.class?.teacher || null,
      },
    }));
  }
}
