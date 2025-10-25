import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ScheduleChangeService } from '../services/schedule-change.service';
import { CreateScheduleChangeDto } from '../dto/schedule-change/create-schedule-change.dto';
import { ScheduleChangeFiltersDto } from '../dto/schedule-change/schedule-change-filters.dto';
import { ScheduleChangeResponseDto } from '../dto/schedule-change/schedule-change-response.dto';

@Controller('schedule-changes')
@UseGuards(JwtAuthGuard)
export class ScheduleChangeController {
  constructor(private readonly scheduleChangeService: ScheduleChangeService) {}

  // Create schedule change request
  @Post()
  async createScheduleChange(
    @Body() createDto: CreateScheduleChangeDto,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string; data: ScheduleChangeResponseDto }> {
    const teacherId = req.user.teacherId;
    const scheduleChange = await this.scheduleChangeService.createScheduleChange(
      createDto,
      teacherId,
    );

    return {
      success: true,
      message: 'Yêu cầu dời lịch đã được tạo thành công',
      data: scheduleChange,
    };
  }

  // Get my schedule change requests
  @Get('my-requests')
  async getMyScheduleChanges(
    @Query() filters: ScheduleChangeFiltersDto,
    @Req() req: any,
  ): Promise<{ success: boolean; data: ScheduleChangeResponseDto[]; meta: any }> {
    const teacherId = req.user.teacherId;
    const result = await this.scheduleChangeService.getMyScheduleChanges(teacherId, filters);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  // Get schedule change detail
  @Get(':id')
  async getScheduleChangeDetail(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ success: boolean; data: ScheduleChangeResponseDto }> {
    const teacherId = req.user.teacherId;
    const scheduleChange = await this.scheduleChangeService.getScheduleChangeDetail(id, teacherId);

    return {
      success: true,
      data: scheduleChange,
    };
  }

  // Cancel schedule change request
  @Put(':id/cancel')
  async cancelScheduleChange(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const teacherId = req.user.teacherId;
    await this.scheduleChangeService.cancelScheduleChange(id, teacherId);

    return {
      success: true,
      message: 'Yêu cầu dời lịch đã được hủy thành công',
    };
  }
}
