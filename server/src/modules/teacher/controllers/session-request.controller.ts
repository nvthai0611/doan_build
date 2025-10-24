import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Param, 
  Body, 
  Query,
  Request,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SessionRequestService } from '../services/session-request.service';
import { CreateSessionRequestDto } from '../dto/session-request/create-session-request.dto';
import { SessionRequestResponseDto } from '../dto/session-request/session-request-response.dto';
import { SessionRequestFiltersDto } from '../dto/session-request/session-request-filters.dto';

@ApiTags('Teacher Session Request')
@Controller('session-request')
export class SessionRequestController {
  constructor(private readonly sessionRequestService: SessionRequestService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo yêu cầu tạo buổi học mới' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tạo yêu cầu thành công',
    type: SessionRequestResponseDto
  })
  async createSessionRequest(
    @Request() req: any,
    @Body() dto: CreateSessionRequestDto,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionRequestService.createSessionRequest(teacherId, dto);
      
      return {
        success: true,
        data: result,
        message: 'Gửi yêu cầu tạo buổi học thành công. Vui lòng chờ chủ trung tâm duyệt.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi tạo yêu cầu tạo buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu tạo buổi học của giáo viên' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách yêu cầu thành công'
  })
  async getMySessionRequests(
    @Request() req: any,
    @Query() filters: SessionRequestFiltersDto,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionRequestService.getMySessionRequests(teacherId, filters);
      
      return {
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit)
        },
        message: 'Lấy danh sách yêu cầu tạo buổi học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu tạo buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu tạo buổi học' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu tạo buổi học' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy chi tiết yêu cầu thành công',
    type: SessionRequestResponseDto
  })
  async getSessionRequestDetail(
    @Request() req: any,
    @Param('id') requestId: string,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionRequestService.getSessionRequestDetail(teacherId, requestId);

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy yêu cầu tạo buổi học hoặc không có quyền truy cập',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Lấy chi tiết yêu cầu tạo buổi học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết yêu cầu tạo buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy yêu cầu tạo buổi học' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu tạo buổi học' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hủy yêu cầu thành công',
    type: SessionRequestResponseDto
  })
  async cancelSessionRequest(
    @Request() req: any,
    @Param('id') requestId: string,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionRequestService.cancelSessionRequest(teacherId, requestId);

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Hủy yêu cầu tạo buổi học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi hủy yêu cầu tạo buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
