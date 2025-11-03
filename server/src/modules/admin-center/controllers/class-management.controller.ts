import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, Patch, Req } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClassManagementService } from '../services/class-management.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { UpdateClassStatusDto } from '../dto/class/update-class-status.dto';
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

    @Patch(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái lớp học' })
    @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async updateStatus(@Param('id') id: string, @Body() updateClassStatusDto: UpdateClassStatusDto) {
        return this.classManagementService.updateStatus(id, updateClassStatusDto);
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

    @Post(':id/clone')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Clone lớp học' })
    @ApiResponse({ status: 201, description: 'Clone lớp học thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học gốc' })
    async cloneClass(@Param('id') id: string, @Body() body: any) {
        return this.classManagementService.cloneClass(id, body);
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

    @Post(':id/transfer-teacher')
    @ApiOperation({ summary: 'Chuyển giáo viên cho lớp' })
    @ApiResponse({ status: 200, description: 'Yêu cầu chuyển giáo viên đã được tạo' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp hoặc giáo viên' })
    async transferTeacher(@Param('id') classId: string, @Body() body: any, @Req() req: any) {
        const requestedBy = req.user?.userId;
        if (!requestedBy) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Không xác định được người yêu cầu',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
        return this.classManagementService.transferTeacher(classId, body, requestedBy);
    }

    @Get('transfers')
    @ApiOperation({ summary: 'Lấy danh sách yêu cầu chuyển giáo viên' })
    @ApiResponse({ status: 200, description: 'Danh sách yêu cầu chuyển giáo viên' })
    async getTransferRequests(@Query() query: any) {
        return this.classManagementService.getTransferRequests(query);
    }

    @Post('transfers/:id/approve')
    @ApiOperation({ summary: 'Duyệt yêu cầu chuyển giáo viên' })
    @ApiResponse({ status: 200, description: 'Duyệt yêu cầu thành công' })
    @ApiResponse({ status: 400, description: 'Yêu cầu đã được xử lý hoặc thiếu thông tin' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
    async approveTransfer(@Param('id') transferId: string, @Body() body: any, @Req() req: any) {
        const approvedBy = req.user?.userId;
        if (!approvedBy) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Không xác định được người duyệt',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
        return this.classManagementService.approveTransfer(transferId, body, approvedBy);
    }

    @Post('transfers/:id/reject')
    @ApiOperation({ summary: 'Từ chối yêu cầu chuyển giáo viên' })
    @ApiResponse({ status: 200, description: 'Từ chối yêu cầu thành công' })
    @ApiResponse({ status: 400, description: 'Yêu cầu đã được xử lý' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
    async rejectTransfer(@Param('id') transferId: string, @Body() body: any, @Req() req: any) {
        const rejectedBy = req.user?.userId;
        if (!rejectedBy) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Không xác định được người từ chối',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
        return this.classManagementService.rejectTransfer(transferId, body, rejectedBy);
    }

    // ============ STATISTICS ============

    @Get(':id/stats')
    @ApiOperation({ summary: 'Lấy thống kê lớp học (số học sinh, capacity)' })
    @ApiResponse({ status: 200, description: 'Thống kê lớp học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async getStats(@Param('id') classId: string) {
        return this.classManagementService.getStats(classId);
    }

    @Get(':id/dashboard')
    @ApiOperation({ summary: 'Lấy dữ liệu dashboard đầy đủ cho lớp học' })
    @ApiResponse({ status: 200, description: 'Dashboard data' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async getDashboard(@Param('id') classId: string) {
        return this.classManagementService.getDashboard(classId);
    }

    @Post(':id/generate-sessions')
    @ApiOperation({ summary: 'Tạo tự động buổi học cho lớp' })
    @ApiResponse({ status: 200, description: 'Tạo buổi học thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async generateSessions(@Param('id') classId: string, @Body() body: any) {
        return this.classManagementService.generateSessions(classId, body);
    }

    @Get(':id/sessions')
    @ApiOperation({ summary: 'Lấy danh sách buổi học của lớp' })
    @ApiResponse({ status: 200, description: 'Danh sách buổi học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async getClassSessions(@Param('id') classId: string, @Query() query: any) {
        return this.classManagementService.getClassSessions(classId, query);
    }

    @Delete(':id/sessions')
    @ApiOperation({ summary: 'Xóa nhiều buổi học' })
    @ApiResponse({ status: 200, description: 'Xóa buổi học thành công' })
    @ApiResponse({ status: 400, description: 'Không thể xóa buổi học đã diễn ra' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy lớp học' })
    async deleteSessions(@Param('id') classId: string, @Body() body: { sessionIds: string[] }) {
        return this.classManagementService.deleteSessions(classId, body.sessionIds);
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

