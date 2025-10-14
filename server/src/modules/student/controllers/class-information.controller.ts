import { Controller, Get, Param, Req } from '@nestjs/common';
import { ClassInformationService } from '../services/class-information.service';

@Controller('class-information')
export class ClassInformationController {
  constructor(private readonly classInfoService: ClassInformationService) {}

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
}
