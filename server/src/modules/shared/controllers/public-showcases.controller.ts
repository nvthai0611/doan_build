import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicShowcasesService } from '../services/public-showcases.service';

@ApiTags('Public - Showcases')
@Controller('public/showcases')
export class PublicShowcasesController {
  constructor(private readonly publicShowcasesService: PublicShowcasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách học sinh tiêu biểu (Public API - không cần auth)',
    description: 'API công khai để hiển thị danh sách học sinh tiêu biểu và xuất sắc trên trang chủ',
  })
  @ApiQuery({
    name: 'featured',
    required: false,
    type: Boolean,
    description: 'Lọc theo học sinh nổi bật (true/false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách học sinh tiêu biểu',
  })
  async getShowcases(@Query('featured') featured?: string) {
    const query: { featured?: boolean } = {};

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    return this.publicShowcasesService.getShowcases(query);
  }
}

