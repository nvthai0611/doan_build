import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeacherFeedbackMonitoringService } from '../services/teacher-feedback-monitoring.service';
import { PrismaService } from '../../../db/prisma.service';

@ApiTags('Admin Center - Teacher Feedback Monitoring')
@Controller('admin-center/feedback-monitoring')
export class TeacherFeedbackMonitoringController {
  constructor(
    private readonly feedbackMonitoringService: TeacherFeedbackMonitoringService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('check-teacher/:teacherId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra feedback của giáo viên (manual check)' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra feedback',
  })
  async checkTeacher(
    @Param('teacherId') teacherId: string,
    @Query() query: { classId?: string; periodDays?: number },
  ) {
    try {
      const result =
        await this.feedbackMonitoringService.checkTeacherFeedbackThresholds(
          teacherId,
          {
            classId: query.classId,
            periodDays: query.periodDays
              ? parseInt(query.periodDays.toString())
              : undefined,
          },
        );

      return {
        success: true,
        data: result,
        message: 'Kiểm tra feedback thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi kiểm tra feedback',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('teachers-at-risk')
  @ApiOperation({ summary: 'Lấy danh sách giáo viên có nguy cơ' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giáo viên có nguy cơ',
  })
  async getTeachersAtRisk(@Query() query: any) {
    return this.feedbackMonitoringService.getTeachersAtRisk(query);
  }

  @Post('auto-transfer-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật cài đặt tự động chuyển giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật cài đặt thành công',
  })
  async updateAutoTransferSettings(@Body() body: any, @Req() req: any) {
    try {
      const updatedBy = req.user?.userId;
      if (!updatedBy) {
        throw new HttpException(
          {
            success: false,
            message: 'Không xác định được người cập nhật',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Update SystemSetting
      const setting = await this.prisma.systemSetting.upsert({
        where: { key: 'feedback_transfer_thresholds' },
          update: {
            value: body,
            updatedBy: updatedBy,
          },
          create: {
            key: 'feedback_transfer_thresholds',
            group: 'feedback',
            value: body,
            description: 'Cài đặt ngưỡng tự động chuyển giáo viên dựa trên feedback',
            updatedBy: updatedBy,
          },
        },
      );

      return {
        success: true,
        data: setting,
        message: 'Cập nhật cài đặt thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật cài đặt',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('monitor-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Monitor tất cả giáo viên (chỉ để hiển thị cảnh báo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Monitor thành công',
  })
  async monitorAll() {
    return this.feedbackMonitoringService.monitorAllTeachers();
  }

  @Get('teacher/:teacherId/feedbacks')
  @ApiOperation({
    summary: 'Lấy danh sách feedbacks của giáo viên để center owner review',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách feedbacks kèm metrics',
  })
  async getTeacherFeedbacksForReview(
    @Param('teacherId') teacherId: string,
    @Query() query: {
      classId?: string;
      periodDays?: number;
      page?: number;
      limit?: number;
    },
  ) {
    return this.feedbackMonitoringService.getTeacherFeedbacksForReview(
      teacherId,
      {
        classId: query.classId,
        periodDays: query.periodDays
          ? parseInt(query.periodDays.toString())
          : undefined,
        page: query.page ? parseInt(query.page.toString()) : undefined,
        limit: query.limit ? parseInt(query.limit.toString()) : undefined,
      },
    );
  }
}

