import { Controller, Get, HttpException, HttpStatus, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaveRequestService } from '../services/leave-request.service';
import { AffectedSessionsQueryDto, AffectedSessionItemDto, ReplacementTeachersQueryDto, ReplacementTeacherDto } from '../dto/leave-request/leave-request.dto';

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

  @Get('replacement-teachers')
  @ApiOperation({ 
    summary: 'Lấy danh sách giáo viên có thể thay thế cho buổi học',
    description: 'API lấy danh sách giáo viên có thể dạy thay cho một buổi học cụ thể'
  })
  @ApiQuery({ name: 'sessionId', required: true, description: 'ID buổi học' })
  @ApiQuery({ name: 'date', required: true, description: 'Ngày học (YYYY-MM-DD)' })
  @ApiQuery({ name: 'time', required: true, description: 'Khung giờ (HH:MM-HH:MM)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách giáo viên thay thế', 
    type: ReplacementTeacherDto, 
    isArray: true 
  })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai tham số' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy buổi học' })
  async getReplacementTeachers(
    @Req() req: any, 
    @Query() query: ReplacementTeachersQueryDto
  ) {
    try {
      const teacherId = req.user?.teacherId;
      const data = await this.leaveRequestService.getReplacementTeachers(
        teacherId, 
        query.sessionId, 
        query.date, 
        query.time
      );
      return {
        success: true,
        data: data,
        message: 'Lấy danh sách giáo viên thay thế thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách giáo viên thay thế',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
