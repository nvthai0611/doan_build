import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicTeachersService } from '../services/public-teachers.service';

@ApiTags('Public - Teachers')
@Controller('public/teachers')
export class PublicTeachersController {
  constructor(private readonly publicTeachersService: PublicTeachersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách giáo viên (Public API - không cần auth)',
    description: 'API công khai để hiển thị danh sách giáo viên trên trang chủ',
  })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách giáo viên' })
  async getTeachers(
    @Query('subjectId') subjectId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.publicTeachersService.getTeachers({
      subjectId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}


