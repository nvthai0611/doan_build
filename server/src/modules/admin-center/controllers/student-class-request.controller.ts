import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { StudentClassRequestService } from '../services/student-class-request.service';
import {
  GetStudentClassRequestsDto,
  RejectRequestDto,
} from '../dto/student-class-request.dto';

@ApiTags('Admin Center - Student Class Requests')
@ApiBearerAuth()
@Controller('student-class-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentClassRequestController {
  constructor(
    private readonly studentClassRequestService: StudentClassRequestService,
  ) {}

  @Get()
  @Roles('center_owner', 'manager')
  @ApiOperation({ summary: 'Lấy danh sách tất cả yêu cầu tham gia lớp' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getAllRequests(@Query() query: GetStudentClassRequestsDto) {
    try {
      return await this.studentClassRequestService.getAllRequests({
        status: query.status,
        classId: query.classId,
        studentId: query.studentId,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 20,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles('center_owner', 'manager')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu tham gia lớp' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  async getRequestById(@Param('id') id: string) {
    try {
      return await this.studentClassRequestService.getRequestById(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/approve')
  @Roles('center_owner', 'manager')
  @ApiOperation({ summary: 'Chấp nhận yêu cầu tham gia lớp' })
  @ApiResponse({ status: 200, description: 'Chấp nhận yêu cầu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu đã được xử lý hoặc lớp đã đầy',
  })
  async approveRequest(@Param('id') id: string, @Body() body?: { overrideCapacity?: boolean }) {
    try {
      return await this.studentClassRequestService.approveRequest(id, body?.overrideCapacity || false);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi chấp nhận yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reject')
  @Roles('center_owner', 'manager')
  @ApiOperation({ summary: 'Từ chối yêu cầu tham gia lớp' })
  @ApiResponse({ status: 200, description: 'Từ chối yêu cầu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  @ApiResponse({ status: 400, description: 'Yêu cầu đã được xử lý' })
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectRequestDto,
  ) {
    try {
      return await this.studentClassRequestService.rejectRequest(id, dto.reason);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi từ chối yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

