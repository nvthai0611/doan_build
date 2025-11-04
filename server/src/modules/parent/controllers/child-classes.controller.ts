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
import { ClassInformationService } from '../services/class-information.service';

@ApiTags('Parent - Child Classes')
@Controller('') // Remove 'parent' since RouterModule already has it
@UseGuards(JwtAuthGuard)
export class ChildClassesController {
  constructor(
    private readonly classInformationService: ClassInformationService,
  ) {}

  @Get('children-classes')
  @ApiOperation({ summary: 'Lấy tất cả lớp học của tất cả con' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách lớp học thành công' })
  async getAllChildrenClasses(@Req() req: any) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.classInformationService.getAllChildrenClasses(
        parentUserId,
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

  @Get('students/:studentId/classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học của một con cụ thể' })
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

      const result = await this.classInformationService.getChildClasses(
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

