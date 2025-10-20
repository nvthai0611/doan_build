import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StudentManagementService } from '../services/student-management.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Parent - Student Management')
@Controller('student-management')
export class StudentManagementController {
  constructor(private readonly service: StudentManagementService) {}

  @Get('children')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Danh sách con của phụ huynh đang đăng nhập' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'grade', required: false })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'enrollmentStatus', required: false, enum: ['enrolled', 'not_enrolled', 'all'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getChildren(@Req() req: any, @Query() query: any) {
    const userId = req.user?.userId;
    const result = await this.service.getChildrenForParent(userId, query);
    return result;
  }

  @Get('children/:childId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chi tiết học sinh của phụ huynh đang đăng nhập' })
  async getChildDetail(@Req() req: any, @Param('childId') childId: string) {
    const userId = req.user?.userId;
    const result = await this.service.getChildDetailForParent(userId, childId);
    return result;
  }

  @Get('children/:childId/metrics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thành tích học tập của học sinh' })
  async getChildMetrics(@Req() req: any, @Param('childId') childId: string) {
    const userId = req.user?.userId;
    return await this.service.getChildMetricsForParent(userId, childId);
  }

  @Get('children/:childId/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lịch học của học sinh' })
  async getChildSchedule(
    @Req() req: any,
    @Param('childId') childId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user?.userId;
    return await this.service.getChildScheduleForParent(userId, childId, startDate, endDate);
  }

  @Get('children/:childId/grades')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Điểm số của học sinh' })
  @ApiQuery({ name: 'classId', required: false, description: 'Lọc theo lớp học' })
  async getChildGrades(
    @Req() req: any,
    @Param('childId') childId: string,
    @Query('classId') classId?: string,
  ) {
    const userId = req.user?.userId;
    return await this.service.getChildGradesForParent(userId, childId, classId);
  }
}
