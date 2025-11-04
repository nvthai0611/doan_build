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

    // Extract childId from params if it exists (query might have nested params)
    const queryAny = query as any;
    const childId = queryAny.params?.childId || query.childId;
    const classId = queryAny.params?.classId || query.classId;
    const limit = queryAny.params?.limit || query.limit;
    const page = queryAny.params?.page || query.page;
    const category = queryAny.params?.category || query.category;
    const search = queryAny.params?.search || query.search;
    
    if (!childId) {
      throw new HttpException({ success: false, message: 'Thiếu tham số childId' }, HttpStatus.BAD_REQUEST);
    }

    const data = await this.materialsService.getMaterialsForChild(parentUserId, {
      childId: String(childId),
      classId: classId ? String(classId) : undefined,
      category: category ? String(category) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search ? String(search) : undefined,
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
