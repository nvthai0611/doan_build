import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { SettingsManagementService } from '../services/settings-management.service';
import { UpdateSettingDto } from '../dto/setting/update-setting.dto';

@Controller('settings-management')
export class SettingsManagementController {
  constructor(private service: SettingsManagementService) {}

  @Get()
  async getAll(@Query('group') group?: string) {
    return this.service.getAll(group);
  }

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return this.service.getByKey(key);
  }

  @Put()
  async upsert(@Body() dto: UpdateSettingDto) {
    return this.service.upsert(dto);
  }
}
