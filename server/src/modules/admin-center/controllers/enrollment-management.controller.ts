import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnrollmentManagementService } from '../services/enrollment-management.service';

@ApiTags('Admin Center - Enrollment Management')
@Controller('enrollments')
export class EnrollmentManagementController {
    constructor(private readonly enrollmentManagementService: EnrollmentManagementService) {}

    // ============ MAIN CRUD OPERATIONS ============

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký 1 học sinh vào lớp' })
    @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
    @ApiResponse({ status: 400, description: 'Đã đăng ký hoặc lớp đầy' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh hoặc lớp' })
    async create(@Body() body: any) {
        return this.enrollmentManagementService.create(body);
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký nhiều học sinh vào lớp' })
    @ApiResponse({ status: 201, description: 'Đăng ký hoàn tất' })
    @ApiResponse({ status: 400, description: 'Không đủ chỗ hoặc dữ liệu không hợp lệ' })
    async bulkEnroll(@Body() body: any) {
        return this.enrollmentManagementService.bulkEnroll(body);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả enrollments với filters' })
    @ApiResponse({ status: 200, description: 'Danh sách enrollments' })
    async findAll(@Query() query: any) {
        return this.enrollmentManagementService.findAll(query);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa enrollment' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy enrollment' })
    async delete(@Param('id') id: string) {
        return this.enrollmentManagementService.delete(id);
    }

    // ============ CLASS-SPECIFIC OPERATIONS ============

    @Get('class/:classId')
    @ApiOperation({ summary: 'Lấy danh sách học sinh trong lớp' })
    @ApiResponse({ status: 200, description: 'Danh sách học sinh' })
    async findByClass(@Param('classId') classId: string, @Query() query: any) {
        return this.enrollmentManagementService.findByClass(classId, query);
    }

    @Get('class/:classId/capacity')
    @ApiOperation({ summary: 'Kiểm tra còn chỗ trong lớp không' })
    @ApiResponse({ status: 200, description: 'Thông tin capacity' })
    async checkCapacity(@Param('classId') classId: string) {
        return this.enrollmentManagementService.checkCapacity(classId);
    }

    @Get('class/:classId/available-students')
    @ApiOperation({ summary: 'Lấy danh sách students CHƯA enroll vào lớp này' })
    @ApiResponse({ status: 200, description: 'Danh sách students có thể thêm vào lớp' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async getAvailableStudents(@Param('classId') classId: string, @Query() query: any) {
        return this.enrollmentManagementService.getAvailableStudents(classId, query);
    }

    // ============ STUDENT-SPECIFIC OPERATIONS ============

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Lấy lịch sử enrollment của học sinh' })
    @ApiResponse({ status: 200, description: 'Lịch sử enrollment' })
    async findByStudent(@Param('studentId') studentId: string) {
        return this.enrollmentManagementService.findByStudent(studentId);
    }

    // ============ STATUS & TRANSFER OPERATIONS ============

    @Put(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái enrollment (active/completed/withdrawn)' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy enrollment' })
    async updateStatus(@Param('id') id: string, @Body() body: any) {
        return this.enrollmentManagementService.updateStatus(id, body);
    }

    @Post(':id/transfer')
    @ApiOperation({ summary: 'Chuyển lớp cho học sinh' })
    @ApiResponse({ status: 200, description: 'Chuyển lớp thành công' })
    @ApiResponse({ status: 400, description: 'Lớp mới đầy hoặc đã đăng ký' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy enrollment hoặc lớp mới' })
    async transfer(@Param('id') id: string, @Body() body: any) {
        return this.enrollmentManagementService.transfer(id, body);
    }
}

