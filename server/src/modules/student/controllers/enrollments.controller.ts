import { Controller, Get, Req } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * GET /student/enrollments
   * Trả về danh sách enrollments của học sinh hiện tại kèm thông tin lớp và môn học
   * Response: { data, message }
   */
  @Get()
  async getMyEnrollments(@Req() req: any) {
    const studentId = req.user?.studentId;
    const data = await this.enrollmentsService.getEnrollmentsOfStudent(studentId);
    return { data, message: 'Lấy danh sách lớp đã ghi danh thành công' };
  }
}
