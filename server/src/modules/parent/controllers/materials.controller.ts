import { Controller, Get, Query, Req, HttpException, HttpStatus, Post, Param, UseGuards } from '@nestjs/common';
import { MaterialsService, GetParentMaterialsDto } from '../services/materials.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMaterials(@Req() req: any, @Query() query: Partial<GetParentMaterialsDto>) {
    const parentUserId = req.user?.userId;
    if (!parentUserId) {
      throw new HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, HttpStatus.UNAUTHORIZED);
    }
    if (!query?.childId) {
      throw new HttpException({ success: false, message: 'Thiếu tham số childId' }, HttpStatus.BAD_REQUEST);
    }

    const data = await this.materialsService.getMaterialsForChild(parentUserId, {
      childId: String(query.childId),
      classId: query.classId ? String(query.classId) : undefined,
      category: query.category ? String(query.category) : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      search: query.search ? String(query.search) : undefined,
    } as any);

    return { success: true, data, message: 'Lấy danh sách tài liệu thành công' };
  }

  @Post(':id/download')
  @UseGuards(JwtAuthGuard)
  async markDownloaded(@Param('id') id: string) {
    await this.materialsService.incrementDownload(Number(id));
    return { success: true, message: 'Ghi nhận tải xuống thành công' };
  }
}
