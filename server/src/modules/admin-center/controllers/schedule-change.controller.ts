import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScheduleChangeAdminService } from '../services/schedule-change.service';

@ApiTags('Admin Center - Schedule Changes')
@Controller('schedule-changes')
export class ScheduleChangeAdminController {
  constructor(private readonly scheduleChangeService: ScheduleChangeAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu dời lịch' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getScheduleChanges(@Query() query: any) {
    try {
      return await this.scheduleChangeService.getScheduleChanges(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách yêu cầu dời lịch',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu dời lịch' })
  @ApiParam({ name: 'id', description: 'ID yêu cầu' })
  async getScheduleChangeById(@Param('id') id: string) {
    try {
      const data = await this.scheduleChangeService.getScheduleChangeById(id);
      return {
        success: true,
        data,
        message: 'Lấy chi tiết yêu cầu dời lịch thành công',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy chi tiết yêu cầu dời lịch',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/:action')
  @ApiOperation({ summary: 'Duyệt/Từ chối yêu cầu dời lịch' })
  @ApiParam({ name: 'id', description: 'ID yêu cầu' })
  @ApiParam({ name: 'action', description: 'approve | reject' })
  @ApiResponse({ status: 200, description: 'Xử lý yêu cầu dời lịch' })
  async handleScheduleChange(
    @Param('id') id: string,
    @Param('action') action: 'approve' | 'reject',
    @Body() body: { notes?: string },
  ) {
    try {
      const data = await this.scheduleChangeService.handleScheduleChange(id, action, body?.notes);
      return {
        success: true,
        data,
        message: action === 'approve' ? 'Đã duyệt yêu cầu dời lịch' : 'Đã từ chối yêu cầu dời lịch',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xử lý yêu cầu dời lịch',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

