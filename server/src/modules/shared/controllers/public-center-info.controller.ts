import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicCenterInfoService } from '../services/public-center-info.service';

@ApiTags('Public - Center Info')
@Controller('public/center-info')
export class PublicCenterInfoController {
  constructor(private readonly publicCenterInfoService: PublicCenterInfoService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy thông tin trung tâm (Public API - không cần auth)',
    description: 'API công khai để hiển thị thông tin trung tâm trên trang chủ',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin trung tâm thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin trung tâm' })
  async getCenterInfo() {
    return this.publicCenterInfoService.getCenterInfo();
  }
}

