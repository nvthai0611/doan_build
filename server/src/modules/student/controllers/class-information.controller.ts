import { Controller, Get, Param, Req } from '@nestjs/common';
import { ClassInformationService } from '../services/class-information.service';
import { PrismaService } from 'src/db/prisma.service';

@Controller('class-information')
export class ClassInformationController {
  constructor(private readonly classInfoService: ClassInformationService, private readonly prisma: PrismaService) {}

  @Get('enrolled-subjects')
  async getEnrolledSubjects(@Req() req: any) {
    const studentId = req.user?.studentId;
    const data = await this.classInfoService.getEnrolledSubjectsByStudent(studentId);
    return { data, message: 'Lấy danh sách môn học đã ghi danh thành công' };
  }

  @Get('classes/:classId/students')
  async getStudentsOfClass(@Param('classId') classId: string) {
    const data = await this.classInfoService.getStudentsOfClassForStudent(classId);
    return { data, message: 'Lấy danh sách thành viên lớp thành công' };
  }

  @Get('classes/:classId')
  async getClassDetail(@Param('classId') classId: string) {
    const data = await this.classInfoService.getClassDetailForStudent(classId);
    return { data, message: 'Lấy chi tiết lớp học thành công' };
  }

  @Get('classes/:classId/sessions')
  async getClassSessionsForStudent(@Param('classId') classId: string) {
    const sessions = await this.prisma.classSession.findMany({
      where: { classId },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      include: {
        room: true,
      },
    });
    // Chuẩn hóa dạng trả về gần giống phía client student đang dùng
    const data = sessions.map((s) => ({
      id: s.id,
      classId: s.classId,
      sessionDate: s.sessionDate as any,
      startTime: (s as any).startTime,
      endTime: (s as any).endTime,
      status: (s as any).status || 'scheduled',
      room: s.room ? { id: s.room.id, name: s.room.name } : null,
    }));
    return { data, message: 'Lấy danh sách buổi học của lớp thành công' };
  }
}
