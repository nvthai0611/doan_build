import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { HolidaysSettingService } from '../services/holidays-setting.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';

@Controller('holidays-setting')
export class HolidaysSettingController {
  constructor(private holidaysService: HolidaysSettingService) {}

  @Get()
  async listHolidays(@Query('year') year?: string) {
    return this.holidaysService.list(year);
  }

  @Post()
  async createHoliday(@Body() dto: CreateHolidayDto) {
    return this.holidaysService.create(dto);
  }

  @Put(':id')
  async updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.holidaysService.update(id, dto);
  }

  @Delete(':id')
  async deleteHoliday(@Param('id') id: string) {
    return this.holidaysService.remove(id);
  }

  @Post(':id/apply')
  async applyHoliday(@Param('id') id: string) {
    return this.holidaysService.apply(id);
  }
}
