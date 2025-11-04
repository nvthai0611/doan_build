import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TeacherStudentLeaveRequestService } from '../services/student-leave-request.service';
import {
  GetStudentLeaveRequestsQueryDto,
  ApproveRejectStudentLeaveRequestDto,
} from '../dto/student-leave-request/student-leave-request.dto';

@ApiTags('Teacher - Student Leave Requests')
@Controller('student-leave-requests')
export class TeacherStudentLeaveRequestController {
  constructor(
    private readonly studentLeaveRequestService: TeacherStudentLeaveRequestService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn nghỉ học của học sinh trong các lớp mình dạy',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Trạng thái (pending, approved, rejected, cancelled)',
  })
  @ApiQuery({ name: 'classId', required: false, description: 'ID lớp học' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm kiếm theo tên học sinh',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getStudentLeaveRequests(
    @Req() req: any,
    @Query() query: GetStudentLeaveRequestsQueryDto,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      if (!teacherId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin giáo viên' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Convert query params to numbers
      const queryParams = {
        ...query,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
      };

      const result =
        await this.studentLeaveRequestService.getStudentLeaveRequests(
          teacherId,
          queryParams,
        );

      return {
        success: true,
        ...result,
        message: 'Lấy danh sách đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn nghỉ học của học sinh' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  async getStudentLeaveRequestById(@Req() req: any, @Param('id') id: string) {
    try {
      const teacherId = req.user?.teacherId;
      if (!teacherId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin giáo viên' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result =
        await this.studentLeaveRequestService.getStudentLeaveRequestById(
          teacherId,
          id,
        );

      return {
        success: true,
        data: result,
        message: 'Lấy chi tiết đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/:action')
  @ApiOperation({ summary: 'Duyệt hoặc từ chối đơn nghỉ học của học sinh' })
  @ApiResponse({ status: 200, description: 'Xử lý đơn nghỉ học thành công' })
  async approveOrRejectStudentLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Param('action') action: 'approve' | 'reject',
    @Body() dto: ApproveRejectStudentLeaveRequestDto,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      if (!teacherId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin giáo viên' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (action !== 'approve' && action !== 'reject') {
        throw new HttpException(
          { success: false, message: 'Action không hợp lệ' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result =
        await this.studentLeaveRequestService.approveOrRejectStudentLeaveRequest(
          teacherId,
          id,
          action,
          dto,
        );

      return {
        success: true,
        data: result,
        message:
          action === 'approve'
            ? 'Duyệt đơn nghỉ học thành công'
            : 'Từ chối đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xử lý đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

