import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubjectManagementService } from '../services/subject-management.service';
import { CreateSubjectDto } from 'src/modules/admin-center/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/modules/admin-center/dto/subject/update-subject.dto';

@ApiTags('Admin Center - Subject Management')
@Controller('subjects')
export class SubjectManagementController {
  constructor(private readonly subjectService: SubjectManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách môn học' })
  async findAll() {
    const data = await this.subjectService.findAll();
    return { success: true, message: 'Lấy danh sách môn học thành công', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết môn học' })
  @ApiParam({ name: 'id', description: 'ID môn học' })
  async findOne(@Param('id') id: string) {
    const data = await this.subjectService.findOne(id);
    return { success: true, message: 'Lấy chi tiết môn học thành công', data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo môn học mới' })
  async create(@Body() dto: CreateSubjectDto) {
    const data = await this.subjectService.create(dto);
    return { success: true, message: 'Tạo môn học thành công', data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật môn học' })
  @ApiParam({ name: 'id', description: 'ID môn học' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    const data = await this.subjectService.update(id, dto);
    return { success: true, message: 'Cập nhật môn học thành công', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa môn học' })
  @ApiParam({ name: 'id', description: 'ID môn học' })
  async remove(@Param('id') id: string) {
    await this.subjectService.remove(id);
    return { success: true, message: 'Xóa môn học thành công' };
  }
}


