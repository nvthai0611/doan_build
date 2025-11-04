import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IncidentReportService } from '../services/incident-report.service';

@ApiTags('Teacher - Incident Reports')
@Controller('incident-report')
export class IncidentReportController {
  constructor(private readonly incidentReportService: IncidentReportService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo sự cố' })
  async create(@Req() req: any, @Body() body: any) {
    const teacherId = req?.user?.teacherId;
    if (!teacherId) {
      throw new HttpException('Không xác định được giáo viên', HttpStatus.UNAUTHORIZED);
    }
    return await this.incidentReportService.createIncidentReport(teacherId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo sự cố của tôi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findMyReports(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    const teacherId = req?.user?.teacherId;
    if (!teacherId) {
      throw new HttpException('Không xác định được giáo viên', HttpStatus.UNAUTHORIZED);
    }
    return await this.incidentReportService.getMyIncidentReports(teacherId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo sự cố' })
  async getDetail(@Req() req: any, @Param('id') id: string) {
    const teacherId = req?.user?.teacherId;
    if (!teacherId) {
      throw new HttpException('Không xác định được giáo viên', HttpStatus.UNAUTHORIZED);
    }
    return await this.incidentReportService.getIncidentReportDetail(teacherId, id);
  }
}


