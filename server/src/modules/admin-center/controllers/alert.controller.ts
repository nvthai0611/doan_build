import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertService } from '../services/alert.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from '../dto/alert.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Alerts')
@Controller('admin-center/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @Roles('center_owner')
  @ApiOperation({ summary: 'Lấy danh sách cảnh báo' })
  async getAlerts(@Query() query: GetAlertsDto) {
    return this.alertService.getAlerts(query);
  }

  @Get('unread-count')
  @Roles('center_owner')
  @ApiOperation({ summary: 'Lấy số lượng cảnh báo chưa đọc' })
  async getUnreadCount() {
    return this.alertService.getUnreadCount();
  }

  @Post()
  @Roles('center_owner')
  @ApiOperation({ summary: 'Tạo cảnh báo mới' })
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.createAlert(createAlertDto);
  }

  @Patch(':id')
  @Roles('center_owner')
  @ApiOperation({ summary: 'Cập nhật cảnh báo' })
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    return this.alertService.updateAlert(id, updateAlertDto);
  }

  @Patch('mark-all-read')
  @Roles('center_owner')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  async markAllAsRead() {
    return this.alertService.markAllAsRead();
  }

  @Delete(':id')
  @Roles('center_owner')
  @ApiOperation({ summary: 'Xóa cảnh báo' })
  async deleteAlert(@Param('id') id: string) {
    return this.alertService.deleteAlert(id);
  }
}

