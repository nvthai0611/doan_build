import { Controller, Get, HttpException, HttpStatus, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaveRequestService } from '../services/leave-request.service';
import { AffectedSessionsQueryDto, AffectedSessionItemDto } from '../dto/leave-request/leave-request.dto';

@ApiTags('Teacher - Leave Requests')
@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Get('affected-sessions')
  @ApiOperation({ summary: 'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ' })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Danh sách buổi học', type: AffectedSessionItemDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai tham số' })
  async getAffectedSessions(@Req() req: any, @Query() query: AffectedSessionsQueryDto) {
    try {
    const teacherId = req.user?.teacherId;
    const data = await this.leaveRequestService.getAffectedSessions(teacherId, query.startDate, query.endDate);
    return {
      success: true,
      data: data,
      message: 'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ thành công',
    };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
