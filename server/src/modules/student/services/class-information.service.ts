import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ClassInformationService {
  constructor(private prisma: PrismaService) {}

  async getEnrolledSubjectsByStudent(studentId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: {
        classes: {
          some: {
            enrollments: { some: { studentId } },
          },
        },
      },
      select: { id: true, code: true, name: true, description: true },
    });
    return subjects;
  }

  async getStudentsOfClassForStudent(classId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      include: { student: { include: { user: true } } },
      orderBy: { enrolledAt: 'asc' },
    });
    return enrollments.map((e) => ({
      id: e.student.id,
      userId: e.student.userId,
      fullName: e.student.user?.fullName,
      email: e.student.user?.email,
      studentCode: e.student.studentCode,
      enrolledAt: e.enrolledAt,
      status: e.status,
    }));
  }

  async getClassDetailForStudent(classId: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        subject: true,
        room: true,
        teacher: { include: { user: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!cls) return null;
    return {
      id: cls.id,
      name: cls.name,
      description: cls.description,
      subject: cls.subject,
      room: cls.room,
      startDate: cls.actualStartDate ?? cls.expectedStartDate ?? null,
      endDate: cls.actualEndDate ?? null,
      maxStudents: cls.maxStudents ?? null,
      currentStudents: cls._count?.enrollments ?? 0,
      teacher: cls.teacher ?? null,
    };
  }
}
