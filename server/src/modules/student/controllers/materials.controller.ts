import { Controller, Get, Query, Req, HttpException, HttpStatus, Post, Param } from '@nestjs/common';
import { MaterialsService, GetStudentMaterialsDto } from '../services/materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async getMaterials(@Req() req: any, @Query() query: GetStudentMaterialsDto) {
    const studentId = req.user?.studentId;
    if (!studentId) {
      throw new HttpException({ success: false, message: 'Không tìm thấy thông tin học sinh' }, HttpStatus.UNAUTHORIZED);
    }

    const data = await this.materialsService.getMaterialsForStudent(studentId, {
      ...query,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
    });

    return { success: true, data, message: 'Lấy danh sách tài liệu thành công' };
  }

  @Post(':id/download')
  async markDownloaded(@Param('id') id: string) {
    await this.materialsService.incrementDownload(Number(id));
    return { success: true, message: 'Ghi nhận tải xuống thành công' };
  }
}
