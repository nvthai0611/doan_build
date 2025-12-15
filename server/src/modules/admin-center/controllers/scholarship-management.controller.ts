import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ScholarshipManagementService } from '../services/scholarship-management.service';
import { CreateScholarshipDto } from '../dto/scholarship/create-scholarship.dto';
import { UpdateScholarshipDto } from '../dto/scholarship/update-scholarship.dto';
import { QueryScholarshipDto } from '../dto/scholarship/query-scholarship.dto';

@ApiTags('Admin Center - Scholarship Management')
@Controller('scholarships')
export class ScholarshipManagementController {
  constructor(
    private readonly scholarshipManagementService: ScholarshipManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách học bổng với pagination' })
  @ApiResponse({ status: 200, description: 'Danh sách học bổng' })
  async findAll(@Query() query: QueryScholarshipDto) {
    const result = await this.scholarshipManagementService.findAll(query);
    return {
      success: true,
      message: 'Lấy danh sách học bổng thành công',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một học bổng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của học bổng' })
  @ApiResponse({ status: 200, description: 'Thông tin học bổng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học bổng' })
  async findOne(@Param('id') id: string) {
    const scholarship = await this.scholarshipManagementService.findOne(id);
    return {
      success: true,
      message: 'Lấy thông tin học bổng thành công',
      data: scholarship,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo học bổng mới' })
  @ApiResponse({ status: 201, description: 'Học bổng được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createScholarshipDto: CreateScholarshipDto) {
    const scholarship =
      await this.scholarshipManagementService.create(createScholarshipDto);
    return {
      success: true,
      message: 'Tạo học bổng thành công',
      data: scholarship,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin học bổng' })
  @ApiParam({ name: 'id', description: 'ID của học bổng' })
  @ApiResponse({ status: 200, description: 'Cập nhật học bổng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học bổng' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async update(
    @Param('id') id: string,
    @Body() updateScholarshipDto: UpdateScholarshipDto,
  ) {
    const scholarship = await this.scholarshipManagementService.update(
      id,
      updateScholarshipDto,
    );
    return {
      success: true,
      message: 'Cập nhật học bổng thành công',
      data: scholarship,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa học bổng' })
  @ApiParam({ name: 'id', description: 'ID của học bổng' })
  @ApiResponse({ status: 200, description: 'Xóa học bổng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học bổng' })
  @ApiResponse({ status: 400, description: 'Học bổng đang được sử dụng' })
  async remove(@Param('id') id: string) {
    return await this.scholarshipManagementService.remove(id);
  }

  @Patch('assign/:studentId')
  @ApiOperation({ summary: 'Gán học bổng cho học sinh' })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiResponse({ status: 200, description: 'Gán học bổng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh hoặc học bổng' })
  async assignToStudent(
    @Param('studentId') studentId: string,
    @Body() body: { scholarshipId: string | null },
  ) {
    const result = await this.scholarshipManagementService.assignToStudent(
      studentId,
      body.scholarshipId,
    );
    return {
      success: true,
      message: body.scholarshipId
        ? 'Gán học bổng cho học sinh thành công'
        : 'Gỡ học bổng khỏi học sinh thành công',
      data: result,
    };
  }
}
