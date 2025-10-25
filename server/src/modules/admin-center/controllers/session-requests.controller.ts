import { Controller, Get, Post, Patch, Query, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SessionRequestsService } from '../services/session-requests.service';

@ApiTags('Admin Center - Session Requests')
@Controller('session-requests')
export class SessionRequestsController {
  constructor(private readonly sessionRequestsService: SessionRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu tạo buổi học' })
  @ApiResponse({ status: 200, description: 'Danh sách yêu cầu tạo buổi học' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'ID giáo viên' })
  @ApiQuery({ name: 'classId', required: false, description: 'ID lớp học' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái (all, pending, approved, rejected)' })
  @ApiQuery({ name: 'requestType', required: false, description: 'Loại yêu cầu (makeup_session, extra_session)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo lý do' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' })
  async getSessionRequests(@Query() query: any) {
    try {
      return await this.sessionRequestsService.getSessionRequests(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách yêu cầu tạo buổi học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu tạo buổi học mới' })
  @ApiResponse({ status: 201, description: 'Tạo yêu cầu tạo buổi học thành công' })
  async createSessionRequest(@Body() body: any) {
    try {
      return await this.sessionRequestsService.createSessionRequest(body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi tạo yêu cầu tạo buổi học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/:action')
  @ApiOperation({ summary: 'Duyệt/từ chối yêu cầu tạo buổi học' })
  @ApiResponse({ status: 200, description: 'Xử lý yêu cầu tạo buổi học thành công' })
  async approveSessionRequest(
    @Param('id') id: string,
    @Param('action') action: 'approve' | 'reject',
    @Body() body: { approverId: string; notes?: string }
  ) {
    try {
      return await this.sessionRequestsService.approveSessionRequest(id, action, body.approverId, body.notes);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xử lý yêu cầu tạo buổi học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu tạo buổi học' })
  @ApiResponse({ status: 200, description: 'Chi tiết yêu cầu tạo buổi học' })
  async getSessionRequestById(@Param('id') id: string) {
    try {
      return {
        success: true,
        data: await this.sessionRequestsService.getSessionRequestById(id),
        message: 'Lấy chi tiết yêu cầu tạo buổi học thành công'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy chi tiết yêu cầu tạo buổi học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}