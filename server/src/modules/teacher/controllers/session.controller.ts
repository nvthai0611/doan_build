import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Request,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SessionService } from '../services/session.service';
import { SessionDetailResponseDto } from '../dto/session/session-detail-response.dto';
import { RescheduleSessionDto } from '../dto/session/reschedule-session.dto';
import { CreateSessionDto } from '../dto/session/create-session.dto';

@ApiTags('Teacher Session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết buổi học' })
  @ApiParam({ name: 'id', description: 'ID của buổi học' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy chi tiết buổi học thành công',
    type: SessionDetailResponseDto
  })
  async getSessionDetail(
    @Request() req: any,
    @Param('id') sessionId: string,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionService.getSessionDetail(teacherId, sessionId);

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy buổi học hoặc không có quyền truy cập',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Lấy chi tiết buổi học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create')
  @ApiOperation({ summary: 'Tạo buổi học mới cho lớp' })
  @ApiResponse({ status: 200, description: 'Tạo buổi học thành công' })
  async createSession(
    @Request() req: any,
    @Body() dto: CreateSessionDto,
  ) {
    try {
      const teacherId = req.user.teacherId
      const result = await this.sessionService.createSession(teacherId, dto)
      return {
        success: true,
        data: result,
        message: 'Tạo buổi học thành công',
      }
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new Error(error.message);
    }
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Tạo yêu cầu dời lịch buổi học' })
  @ApiParam({ name: 'id', description: 'ID của buổi học' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tạo yêu cầu dời lịch thành công',
    type: SessionDetailResponseDto
  })
  async rescheduleSession(
    @Request() req: any,
    @Param('id') sessionId: string,
    @Body() rescheduleDto: RescheduleSessionDto,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionService.rescheduleSession(
        teacherId,
        sessionId,
        rescheduleDto,
      );

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy buổi học hoặc không có quyền dời lịch',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Yêu cầu dời lịch buổi học đã được tạo thành công. Vui lòng chờ phê duyệt.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi tạo yêu cầu dời lịch buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Lấy danh sách học viên trong buổi học' })
  @ApiParam({ name: 'id', description: 'ID của buổi học' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách học viên thành công'
  })
  async getSessionStudents(
    @Request() req: any,
    @Param('id') sessionId: string,
  ) {
    try {
      const teacherId = req.user.teacherId;
      const result = await this.sessionService.getSessionStudents(teacherId, sessionId);

      return {
        success: true,
        data: result,
        message: 'Lấy danh sách học viên thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách học viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
