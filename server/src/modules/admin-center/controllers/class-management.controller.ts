import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClassManagementService } from '../services/class-management.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';

@ApiTags('Admin Center - Class Management')
@Controller('classes')
export class ClassManagementController {
    constructor(private readonly classManagementService: ClassManagementService) {}

    // ============ MAIN CRUD OPERATIONS ============

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo lớp học mới' })
    @ApiResponse({ status: 201, description: 'Tạo lớp học thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(@Body() createClassDto: CreateClassDto) {
        return this.classManagementService.create(createClassDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả lớp học với filters' })
    @ApiResponse({ status: 200, description: 'Danh sách lớp học' })
    async findAll(@Query() queryDto: QueryClassDto) {
        return this.classManagementService.findAll(queryDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết 1 lớp học' })
    @ApiResponse({ status: 200, description: 'Chi tiết lớp học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async findOne(@Param('id') id: string) {
        return this.classManagementService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin lớp học' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
        return this.classManagementService.update(id, updateClassDto);
    }

    @Patch(':id/schedules')
    @ApiOperation({ summary: 'Cập nhật lịch học' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async updateClassSchedules(@Param('id') id: string, @Body() body: any) {
        return this.classManagementService.updateClassSchedules(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa lớp học (soft delete)' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 400, description: 'Không thể xóa lớp có học sinh đang học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async delete(@Param('id') id: string) {
        return this.classManagementService.delete(id);
    }

    // ============ TEACHER ASSIGNMENT ============

    @Post(':id/assign-teacher')
    @ApiOperation({ summary: 'Phân công giáo viên cho lớp' })
    @ApiResponse({ status: 200, description: 'Phân công thành công' })
    @ApiResponse({ status: 400, description: 'Giáo viên đã được phân công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp hoặc giáo viên' })
    async assignTeacher(@Param('id') classId: string, @Body() body: any) {
        return this.classManagementService.assignTeacher(classId, body);
    }

    @Delete(':id/teachers/:teacherId')
    @ApiOperation({ summary: 'Xóa phân công giáo viên' })
    @ApiResponse({ status: 200, description: 'Xóa phân công thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phân công' })
    async removeTeacher(
        @Param('id') classId: string, 
        @Param('teacherId') teacherId: string
    ) {
        return this.classManagementService.removeTeacher(classId, teacherId);
    }

    @Get(':id/teachers')
    @ApiOperation({ summary: 'Lấy danh sách giáo viên của lớp' })
    @ApiResponse({ status: 200, description: 'Danh sách giáo viên' })
    async getTeachersByClass(@Param('id') classId: string) {
        return this.classManagementService.getTeachersByClass(classId);
    }

    // ============ STATISTICS ============

    @Get(':id/stats')
    @ApiOperation({ summary: 'Lấy thống kê lớp học (số học sinh, capacity)' })
    @ApiResponse({ status: 200, description: 'Thống kê lớp học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async getStats(@Param('id') classId: string) {
        return this.classManagementService.getStats(classId);
    }

    // ============ LEGACY ENDPOINTS (Backward Compatibility) ============

    @Get('/:teacherId/teacher')
    @ApiParam({ name: 'teacherId', description: 'ID của giáo viên (UUID)' })
    @ApiOperation({ summary: '[LEGACY] Lấy danh sách lớp học theo ID giáo viên' })
    @ApiResponse({ status: 200, description: 'Danh sách lớp học' })
    async getClassByTeacher(@Query() query: any, @Param('teacherId') teacherId: string) {
        return this.classManagementService.getClassByTeacherId(query, teacherId);
    }

    @Get('class-by-teacher/:id')
    @ApiOperation({ summary: '[LEGACY] Lấy chi tiết lớp học theo ID' })
    @ApiResponse({ status: 200, description: 'Chi tiết lớp học' })
    async getClassByTeacherId(@Param('id') id: string) {
        return this.classManagementService.getClassDetail(id);
    }

    @Post('class-by-teacher')
    @ApiOperation({ summary: '[LEGACY] Tạo lớp học' })
    @ApiResponse({ status: 200, description: 'Lớp học' })
    async createClassLegacy(@Body() body: any) {
        return this.classManagementService.createClass(body);
    }
}

