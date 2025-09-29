import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Query, 
  Body, 
  UseGuards, 
  Request,
  HttpException,
  HttpStatus,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ScheduleService } from '../services/schedule.service';
import { UpdateScheduleStatusDto } from '../dto/schedule/update-schedule-status.dto';
import { ScheduleFiltersDto } from '../dto/schedule/schedule-filters.dto';

@ApiTags('Teacher Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}
  teacherId = 'd37a2030-f63d-4b7d-b22f-210ceacaa51a';

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch dạy của giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lịch dạy thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi server',
  })
  async getMySchedule(
    @Request() req: any,
    @Query() filters: ScheduleFiltersDto,
  ) {
    try {
      // TODO: Lấy teacherId từ JWT token sau
      const teacherId = this.teacherId;
      const result = await this.scheduleService.getTeacherSchedule(
        teacherId,
        filters,
      );

      return {
        success: true,
        data: result,
        message: 'Lấy danh sách lịch dạy thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách lịch dạy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Lấy lịch dạy theo tuần' })
  @ApiQuery({
    name: 'weekStart',
    description: 'Ngày bắt đầu tuần (YYYY-MM-DD)',
  })
  async getWeeklySchedule(
    @Request() req: any,
    @Query('weekStart') weekStart: string,
  ) {
    try {
      // TODO: Lấy teacherId từ JWT token sau
      const teacherId = this.teacherId;
      const result = await this.scheduleService.getWeeklySchedule(
        teacherId,
        weekStart,
      );

      return {
        success: true,
        data: result,
        message: 'Lấy lịch dạy theo tuần thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy lịch dạy theo tuần',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Lấy lịch dạy theo tháng' })
  @ApiQuery({ name: 'year', description: 'Năm' })
  @ApiQuery({ name: 'month', description: 'Tháng (1-12)' })
  async getMonthlySchedule(
    @Request() req: any,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    try {
      // TODO: Lấy teacherId từ JWT token sau
      const teacherId = this.teacherId;
      const result = await this.scheduleService.getMonthlySchedule(
        teacherId,
        year,
        month,
      );

      return {
        success: true,
        data: result,
        message: 'Lấy lịch dạy theo tháng thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy lịch dạy theo tháng',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một buổi dạy' })
  @ApiParam({ name: 'id', description: 'ID của buổi dạy' })
  async getScheduleDetail(
    @Request() req: any,
    @Param('id') scheduleId: string,
  ) {
    try {
      // TODO: Lấy teacherId từ JWT token sau
      const teacherId = this.teacherId;
      const result = await this.scheduleService.getScheduleDetail(
        teacherId,
        scheduleId,
      );

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy buổi dạy',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Lấy chi tiết buổi dạy thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết buổi dạy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái buổi dạy' })
  @ApiParam({ name: 'id', description: 'ID của buổi dạy' })
  async updateScheduleStatus(
    @Request() req: any,
    @Param('id') scheduleId: string,
    @Body() updateStatusDto: UpdateScheduleStatusDto,
  ) {
    try {
      // TODO: Lấy teacherId từ JWT token sau
      const teacherId = this.teacherId;
      const result = await this.scheduleService.updateScheduleStatus(
        teacherId,
        scheduleId,
        updateStatusDto,
      );

      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy buổi dạy hoặc không có quyền cập nhật',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Cập nhật trạng thái buổi dạy thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật trạng thái buổi dạy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}