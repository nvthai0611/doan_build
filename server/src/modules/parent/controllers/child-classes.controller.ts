import {
  Controller,
  Get,
  Param,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StudentLeaveRequestService } from '../services/student-leave-request.service';

@ApiTags('Parent - Student Management')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class ChildClassesController {
  constructor(
    private readonly studentLeaveRequestService: StudentLeaveRequestService,
  ) {}

  @Get(':studentId/classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học của con' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách lớp học thành công' })
  async getChildClasses(@Req() req: any, @Param('studentId') studentId: string) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.studentLeaveRequestService.getChildClasses(
        parentUserId,
        studentId,
      );

      return {
        success: true,
        data: result,
        message: 'Lấy danh sách lớp học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

