import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentProfileByStudentId(studentId: string) {
    if (!studentId) return null;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        school: true,
        parent: { include: { user: true } },
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          include: {
            class: { include: { subject: true } },
          },
        },
      },
    });

    if (!student) return null;

    const user = student.user;
    return {
      id: user?.id || '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      isActive: user?.isActive ?? true,
      studentId: student.id,
      studentCode: student.studentCode || undefined,
      dateOfBirth: (user?.birthDate as unknown as string) || undefined,
      gender: (user?.gender ? String(user.gender).toLowerCase() : undefined) as 'male' | 'female' | 'other' | undefined,
      address: student.address || undefined,
      grade: student.grade || undefined,
      school: student.school ? {
        id: student.school.id,
        name: student.school.name,
        address: (student.school as any).address || undefined,
        phone: (student.school as any).phone || undefined,
      } : { id: '', name: '' },
      enrollments: (student.enrollments || []).map((e) => ({
        id: e.id,
        classId: e.classId,
        status: e.status as unknown as string,
        enrolledAt: e.enrolledAt as unknown as string,
        class: {
          id: e.class?.id || '',
          name: e.class?.name || '',
          subject: e.class?.subject?.name || '',
        },
      })),
      parentLinks: student.parent ? [{
        id: student.parent.id,
        parentId: student.parent.id,
        relation: undefined,
        primaryContact: true,
        parent: {
          id: student.parent.id,
          user: {
            fullName: student.parent.user?.fullName || '',
            email: student.parent.user?.email || '',
            phone: student.parent.user?.phone || undefined,
          }
        }
      }] : [],
    };
  }
}
