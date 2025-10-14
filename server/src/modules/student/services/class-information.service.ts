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
        teacherClassAssignments: {
          orderBy: { startDate: 'desc' },
          take: 1,
          include: { teacher: { include: { user: true } } },
        },
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
      startDate: (cls as any).startDate ?? cls.teacherClassAssignments?.[0]?.startDate ?? null,
      endDate: (cls as any).endDate ?? cls.teacherClassAssignments?.[0]?.endDate ?? null,
      maxStudents: cls.maxStudents ?? cls.teacherClassAssignments?.[0]?.maxStudents ?? null,
      currentStudents:
        (cls as any).currentStudents ?? cls.teacherClassAssignments?.[0]?.currentStudents ?? cls._count?.enrollments ?? 0,
      teacher: cls.teacherClassAssignments?.[0]?.teacher ?? null,
    };
  }
}
