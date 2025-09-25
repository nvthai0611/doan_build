import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScheduleManagementService } from '../services/schedule-management.service';
import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';

@ApiTags('Admin Center - Schedule Management')
@Controller('admin-center/schedule-management')
export class ScheduleManagementController {
  constructor(private readonly scheduleService: ScheduleManagementService) {}

  @Get('sessions/day')
  @ApiOperation({ summary: 'Lấy lịch theo ngày' })
  async getByDay(@Query() query: QueryScheduleDto) {
    const data = await this.scheduleService.getScheduleByDay(query);
    return { data, message: 'Lấy lịch theo ngày thành công' };
  }

  @Get('sessions/week')
  @ApiOperation({ summary: 'Lấy lịch theo tuần' })
  async getByWeek(@Query() query: QueryScheduleWeekDto) {
    const data = await this.scheduleService.getScheduleByWeek(query);
    return { data, message: 'Lấy lịch theo tuần thành công' };
  }

  @Get('sessions/month')
  @ApiOperation({ summary: 'Lấy lịch theo tháng' })
  async getByMonth(@Query() query: QueryScheduleMonthDto) {
    // Parse thủ công month/year từ string và validate phạm vi
    const monthNum = Number(query.month);
    const yearNum = Number(query.year);
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('month must be an integer between 1 and 12');
    }
    if (!Number.isInteger(yearNum) || yearNum < 1970 || yearNum > 3000) {
      throw new Error('year must be an integer between 1970 and 3000');
    }
    const data = await this.scheduleService.getScheduleByMonth({ month: monthNum as any, year: yearNum as any });
    return { data, message: 'Lấy lịch theo tháng thành công' };
  }
}
