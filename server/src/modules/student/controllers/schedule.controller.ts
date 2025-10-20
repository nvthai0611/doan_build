import { Controller, Get, Param, Query, HttpException, HttpStatus, Request } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StudentScheduleService } from '../services/schedule.service';
import { ScheduleFiltersDto } from '../dto/schedule-filters.dto';

@ApiTags('Student Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: StudentScheduleService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Lấy lịch học theo tuần (student)' })
  @ApiQuery({ name: 'weekStart', description: 'Ngày bắt đầu tuần (YYYY-MM-DD)' })
  async getWeeklySchedule(
    @Request() req: any,
    @Query('weekStart') weekStart: string,
  ) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        throw new HttpException(
          { success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      if (!weekStart) {
        throw new HttpException(
          { success: false, error: 'Week start date is required', message: 'Ngày bắt đầu tuần là bắt buộc' },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      const data = await this.scheduleService.getWeeklySchedule(studentId, weekStart);
      return { success: true, data, message: 'Lấy lịch học theo tuần thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message, message: 'Có lỗi khi lấy lịch tuần' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Lấy lịch học theo tháng (student)' })
  @ApiQuery({ name: 'year', description: 'Năm' })
  @ApiQuery({ name: 'month', description: 'Tháng (1-12)' })
  async getMonthlySchedule(
    @Request() req: any,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        throw new HttpException(
          { success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      if (!year || !month || month < 1 || month > 12) {
        throw new HttpException(
          { success: false, error: 'Invalid year or month', message: 'Năm hoặc tháng không hợp lệ' },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      const data = await this.scheduleService.getMonthlySchedule(studentId, year, month);
      return { success: true, data, message: 'Lấy lịch học theo tháng thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message, message: 'Có lỗi khi lấy lịch tháng' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy lịch học của học sinh theo khoảng ngày' })
  @ApiQuery({ name: 'startDate', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: 'YYYY-MM-DD' })
  async getSchedule(@Request() req: any, @Query() filters: ScheduleFiltersDto) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        throw new HttpException(
          { success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.scheduleService.getSchedule(studentId, filters);
      return { success: true, data, message: 'Lấy lịch học thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message, message: 'Không thể lấy lịch học' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Lấy chi tiết một buổi học của học sinh' })
  @ApiParam({ name: 'sessionId', description: 'ID buổi học' })
  async getSessionById(@Request() req: any, @Param('sessionId') sessionId: string) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        throw new HttpException(
          { success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      const data = await this.scheduleService.getSessionById(studentId, sessionId);
      if (!data) {
        throw new HttpException(
          { success: false, error: 'Session not found', message: 'Không tìm thấy buổi học' },
          HttpStatus.NOT_FOUND,
        );
      }
      
      return { success: true, data, message: 'Lấy chi tiết buổi học thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message, message: 'Không thể lấy chi tiết buổi học' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lịch học theo id (student)' })
  @ApiParam({ name: 'id', description: 'ID lịch/buổi học' })
  async getScheduleDetail(@Request() req: any, @Param('id') id: string) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        throw new HttpException(
          { success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      const data = await this.scheduleService.getScheduleDetail(studentId, id);
      if (!data) {
        throw new HttpException(
          { success: false, error: 'Schedule not found', message: 'Không tìm thấy lịch học' },
          HttpStatus.NOT_FOUND,
        );
      }
      
      return { success: true, data, message: 'Lấy chi tiết lịch học thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message, message: 'Không thể lấy chi tiết lịch học' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
