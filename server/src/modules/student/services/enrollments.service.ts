import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getEnrollmentsOfStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        studentId,
        // Hiển thị các lớp:
        // - Đang học (studying)
        // - Đã tốt nghiệp / hoàn thành (graduated)
        // - Đã dừng giữa chừng (stopped)
        status: {
          in: ['studying', 'graduated', 'stopped'],
        },
        class: {
          // Chỉ các lớp đang hoặc đã hoàn thành
          status: {
            in: ['active', 'completed'],
          },
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
