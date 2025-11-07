import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ClassJoinService } from '../services/class-join.service';
import { JoinClassByCodeDto, RequestJoinClassDto } from '../dto/request/join-class.dto';

@ApiTags('Parent - Class Join')
@Controller('class-join')
export class ClassJoinController {
  constructor(private readonly classJoinService: ClassJoinService) {}

  @Post('get-class-info')
  @ApiOperation({ summary: 'Lấy thông tin lớp học từ classCode hoặc link' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin lớp học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
  async getClassInfo(@Req() req: any, @Body() dto: JoinClassByCodeDto) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.classJoinService.getClassInfoByCodeOrLink(userId, dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('request-join')
  @UseInterceptors(AnyFilesInterceptor()) // Enable multipart/form-data parsing
  @ApiOperation({ summary: 'Gửi yêu cầu tham gia lớp học cho con' })
  @ApiResponse({ status: 201, description: 'Gửi yêu cầu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học hoặc học sinh' })
  @ApiResponse({ status: 400, description: 'Lớp học đã đầy, đã có yêu cầu pending, hoặc lịch học bị trùng với các lớp đã đăng ký' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        classId: { type: 'string', format: 'uuid' },
        studentId: { type: 'string', format: 'uuid' },
        contractUploadId: { type: 'string', format: 'uuid', description: 'ID của hợp đồng đã upload (BẮT BUỘC)' },
        password: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['classId', 'studentId', 'contractUploadId']
    },
  })
  async requestJoinClass(@Req() req: any, @Body() dto: RequestJoinClassDto) {
    
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.classJoinService.requestJoinClass(userId, dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi gửi yêu cầu tham gia',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu tham gia lớp của parent' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách yêu cầu thành công' })
  async getMyRequests(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.classJoinService.getMyClassRequests(userId, {
        status,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
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
}

