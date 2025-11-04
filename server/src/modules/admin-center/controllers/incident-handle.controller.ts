import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IncidentHandleService } from '../services/incident-handle.service';

@ApiTags('Admin Center - Incident Handle')
@Controller('incident-handle')
export class IncidentHandleController {
  constructor(private readonly incidentHandleService: IncidentHandleService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách báo cáo sự cố' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'severity', required: false, type: String })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return await this.incidentHandleService.listIncidents({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      severity,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái xử lý sự cố' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new HttpException('Thiếu trạng thái', HttpStatus.BAD_REQUEST);
    }
    return await this.incidentHandleService.updateStatus(id, body.status);
  }
}


