import { Controller, Get, HttpException, HttpStatus, Post, Patch, Query, Req, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { LeaveRequestService } from '../services/leave-request.service';
import { AffectedSessionsQueryDto, AffectedSessionItemDto, ReplacementTeachersQueryDto, ReplacementTeacherDto, LeaveRequestDto } from '../dto/leave-request/leave-request.dto';

@ApiTags('Teacher - Leave Requests')
@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Get('affected-sessions')
  @ApiOperation({
    summary: 'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ',
  })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách buổi học',
    type: AffectedSessionItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai tham số' })
  async getAffectedSessions(
    @Req() req: any,
    @Query() query: AffectedSessionsQueryDto,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      const data = await this.leaveRequestService.getAffectedSessions(
        teacherId,
        query.startDate,
        query.endDate,
      );
      return {
        success: true,
        data: data,
        message:
          'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            'Có lỗi xảy ra khi lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('replacement-teachers')
  @ApiOperation({
    summary: 'Lấy danh sách giáo viên có thể thay thế cho buổi học',
    description:
      'API lấy danh sách giáo viên có thể dạy thay cho một buổi học cụ thể',
  })
  @ApiQuery({ name: 'sessionId', required: true, description: 'ID buổi học' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Ngày học (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'time',
    required: true,
    description: 'Khung giờ (HH:MM-HH:MM)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giáo viên thay thế',
    type: ReplacementTeacherDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai tham số' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy buổi học' })
  async getReplacementTeachers(
    @Req() req: any,
    @Query() query: ReplacementTeachersQueryDto,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      const data = await this.leaveRequestService.getReplacementTeachers(
        teacherId,
        query.sessionId,
        query.date,
        query.time,
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

  @Get('my-requests')
  @ApiOperation({ summary: 'Lấy danh sách đơn của giáo viên' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái đơn' })
  @ApiQuery({ name: 'requestType', required: false, description: 'Loại đơn' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn của giáo viên' })
  async getMyLeaveRequests(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('requestType') requestType?: string,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      const data = await this.leaveRequestService.getMyLeaveRequests(
        teacherId,
        {
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          status,
          requestType,
        }
      );
      return {
        success: true,
        data: data,
        message: 'Lấy danh sách đơn thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách đơn',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-leave-request')
  @ApiOperation({ summary: 'Tạo yêu cầu nghỉ' })
  @ApiBody({ type: LeaveRequestDto})
  @ApiResponse({
    status: 200,
    description: 'Yêu cầu nghỉ đã được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai tham số' })
  async createLeaveRequest(@Req() req: any, @Body() body: LeaveRequestDto) {
    try {
      const teacherId = req.user?.teacherId;

      const data = await this.leaveRequestService.createLeaveRequest(
        teacherId,
        body,
        body.affectedSessions,
        req.user?.userId,
      );
      return {
        success: true,
        data: data,
        message: 'Yêu cầu nghỉ đã được tạo thành công',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn xin nghỉ' })
  @ApiParam({ name: 'id', description: 'ID của đơn xin nghỉ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hủy đơn thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Chỉ có thể hủy đơn đang chờ duyệt',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn xin nghỉ',
  })
  async cancelLeaveRequest(@Req() req: any, @Param('id') id: string) {
    try {
      const teacherId = req.user?.teacherId;
      if (!teacherId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin giáo viên' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.leaveRequestService.cancelLeaveRequest(teacherId, id);

      return {
        success: true,
        message: 'Hủy đơn xin nghỉ thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi hủy đơn xin nghỉ',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
