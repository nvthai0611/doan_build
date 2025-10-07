import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GradeService } from '../services/grade.service';
import { RecordGradesDto } from '../dto/grade/record-grades.dto';
import { UpdateGradeDto } from '../dto/grade/update-grade.dto';

@ApiTags('Teacher - Grades')
@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradeController {
    constructor(private readonly gradeService: GradeService) {}

    @Get('class-students')
    @ApiOperation({ summary: 'Lấy danh sách học sinh của lớp (kèm điểm TB hiện tại)' })
    @ApiQuery({ name: 'classId', required: true, description: 'ID lớp (UUID)' })
    async getStudents(@Req() request: any, @Query('classId') classId: string) {
        console.log('🎓 API getStudents called with classId:', classId);
        console.log('🎓 Request user:', request.user);
        
        const teacherId = request.user?.teacherId;
        console.log('🎓 Teacher ID:', teacherId);
        
        if (!teacherId) {
            console.log('❌ No teacher ID found');
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: [], 
                message: 'Không tìm thấy thông tin giáo viên', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.getStudentsOfClass(teacherId, classId);
            console.log('🎓 Service returned data:', data);
            console.log('🎓 Data length:', data?.length || 0);
            
            return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
        } catch (error) {
            console.error('❌ Error in getStudents:', error);
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: error.message || 'Có lỗi xảy ra', 
                meta: null 
            };
        }
    }

    @Get('assessments')
    @ApiOperation({ summary: 'Danh sách assessments của lớp' })
    @ApiQuery({ name: 'classId', required: true })
    async getAssessments(@Req() request: any, @Query('classId') classId: string) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.listAssessments(teacherId, classId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Get('assessment-types')
    @ApiOperation({ summary: 'Danh sách loại kiểm tra (distinct type) trong các lớp giáo viên đang dạy hoặc theo class' })
    @ApiQuery({ name: 'classId', required: false })
    async getAssessmentTypes(@Req() request: any, @Query('classId') classId?: string) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.listAssessmentTypes(teacherId, classId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Get('assessments/:assessmentId/grades')
    @ApiOperation({ summary: 'Lấy điểm theo assessment' })
    async getAssessmentGrades(@Req() request: any, @Param('assessmentId') assessmentId: string) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.getAssessmentGrades(teacherId, assessmentId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Post('record')
    @ApiOperation({ summary: 'Tạo assessment và ghi điểm hàng loạt' })
    async record(@Req() request: any, @Body() payload: RecordGradesDto) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.recordGrades(teacherId, payload);
        return { success: true, status: HttpStatus.CREATED, data, message: 'Đã tạo assessment và ghi điểm', meta: null };
    }

    @Put('update')
    @ApiOperation({ summary: 'Cập nhật điểm một học sinh cho một assessment' })
    async update(@Req() request: any, @Body() payload: UpdateGradeDto) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.updateGrade(teacherId, payload);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }
}
