import { Controller, Get, Post, Put, Delete, Patch, Query, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeaveRequestsService } from '../services/leave-requests.service';

@ApiTags('Admin Center - Leave Requests')
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn xin nghỉ' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn xin nghỉ' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'ID giáo viên' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái (all, pending, approved, rejected)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo loại nghỉ, lý do' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' })
  async getLeaveRequests(@Query() query: any) {
    try {
      console.log(query);
      
      return await this.leaveRequestsService.getLeaveRequests(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn xin nghỉ mới' })
  @ApiResponse({ status: 201, description: 'Tạo đơn xin nghỉ thành công' })
  async createLeaveRequest(@Body() body: any) {
    try {
      return await this.leaveRequestsService.createLeaveRequest(body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi tạo đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn xin nghỉ' })
  @ApiResponse({ status: 200, description: 'Cập nhật đơn xin nghỉ thành công' })
  async updateLeaveRequest(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.leaveRequestsService.updateLeaveRequest(id, body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn xin nghỉ' })
  @ApiResponse({ status: 200, description: 'Xóa đơn xin nghỉ thành công' })
  async deleteLeaveRequest(@Param('id') id: string) {
    try {
      return await this.leaveRequestsService.deleteLeaveRequest(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xóa đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/:action')
  @ApiOperation({ summary: 'Duyệt/từ chối đơn xin nghỉ' })
  @ApiResponse({ status: 200, description: 'Xử lý đơn xin nghỉ thành công' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @Param('action') action: 'approve' | 'reject',
    @Body() body: { approverId: string; notes?: string }
  ) {
    try {
      return await this.leaveRequestsService.approveLeaveRequest(id, action, body.approverId, body.notes);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xử lý đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats/:teacherId')
  @ApiOperation({ summary: 'Lấy thống kê đơn xin nghỉ của giáo viên' })
  @ApiResponse({ status: 200, description: 'Thống kê đơn xin nghỉ' })
  async getLeaveRequestStats(@Param('teacherId') teacherId: string) {
    try {
      return await this.leaveRequestsService.getLeaveRequestStats(teacherId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy thống kê đơn xin nghỉ',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
