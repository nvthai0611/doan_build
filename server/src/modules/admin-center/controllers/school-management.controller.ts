import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SchoolManagementService } from '../services/school-management.service';
import { CreateSchoolDto } from '../dto/school/create-school.dto';
import { UpdateSchoolDto } from '../dto/school/update-school.dto';

@ApiTags('Admin Center - School Management')
@Controller('schools')
export class SchoolManagementController {
  constructor(private readonly schoolManagementService: SchoolManagementService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan' })
  @ApiResponse({ status: 200, description: 'Thống kê trường học, học sinh, giáo viên' })
  async getStats() {
    const stats = await this.schoolManagementService.getStats();
    return {
      success: true,
      message: 'Lấy thống kê thành công',
      data: stats,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả trường học' })
  @ApiResponse({ status: 200, description: 'Danh sách trường học' })
  async findAll() {
    const schools = await this.schoolManagementService.findAll();
    return {
      success: true,
      message: 'Lấy danh sách trường học thành công',
      data: schools,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một trường học theo ID' })
  @ApiParam({ name: 'id', description: 'ID của trường học' })
  @ApiResponse({ status: 200, description: 'Thông tin trường học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy trường học' })
  async findOne(@Param('id') id: string) {
    const school = await this.schoolManagementService.findOne(id);
    return {
      success: true,
      message: 'Lấy thông tin trường học thành công',
      data: school,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo trường học mới' })
  @ApiResponse({ status: 201, description: 'Trường học được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc trường học đã tồn tại' })
  async create(@Body() createSchoolDto: CreateSchoolDto) {
    const school = await this.schoolManagementService.create(createSchoolDto);
    return {
      success: true,
      message: 'Tạo trường học thành công',
      data: school,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin trường học' })
  @ApiParam({ name: 'id', description: 'ID của trường học' })
  @ApiResponse({ status: 200, description: 'Cập nhật trường học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy trường học' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    const school = await this.schoolManagementService.update(id, updateSchoolDto);
    return {
      success: true,
      message: 'Cập nhật trường học thành công',
      data: school,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa trường học' })
  @ApiParam({ name: 'id', description: 'ID của trường học' })
  @ApiResponse({ status: 200, description: 'Xóa trường học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy trường học' })
  @ApiResponse({ status: 400, description: 'Trường học đang được sử dụng' })
  async remove(@Param('id') id: string) {
    return await this.schoolManagementService.remove(id);
  }
}
