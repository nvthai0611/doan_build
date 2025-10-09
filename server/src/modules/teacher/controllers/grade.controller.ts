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
        console.log('🎯 API /teacher/grades/record called with payload:', payload);
        console.log('🎯 Request user:', request.user);
        
        // Validate max score = 10
        if (payload.maxScore && payload.maxScore !== 10) {
            console.log('❌ Invalid max score:', payload.maxScore);
            return { 
                success: false, 
                status: HttpStatus.BAD_REQUEST, 
                data: null, 
                message: 'Max score phải là 10 điểm', 
                meta: null 
            };
        }
        
        // Validate individual scores
        if (payload.grades && payload.grades.length > 0) {
            const invalidScores = payload.grades.filter(g => g.score !== undefined && g.score !== null && (g.score < 0 || g.score > 10));
            if (invalidScores.length > 0) {
                console.log('❌ Invalid individual scores:', invalidScores);
                return { 
                    success: false, 
                    status: HttpStatus.BAD_REQUEST, 
                    data: null, 
                    message: 'Điểm số phải từ 0 đến 10', 
                    meta: null 
                };
            }
        }
        
        const userId = request.user?.userId;
        console.log('🎯 User ID:', userId);
        console.log('🎯 Payload received:', JSON.stringify(payload, null, 2));
        
        // Validate userId
        if (!userId) {
            console.log('❌ No user ID found');
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: null, 
                message: 'ID không hợp lệ', 
                meta: null 
            };
        }
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            console.log('❌ Invalid user ID format:', userId);
            return { 
                success: false, 
                status: HttpStatus.BAD_REQUEST, 
                data: null, 
                message: 'ID không hợp lệ', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.recordGrades(userId, payload);
            console.log('✅ Service returned data:', data);
            
            return { success: true, status: HttpStatus.CREATED, data, message: 'Đã tạo assessment và ghi điểm', meta: null };
        } catch (error) {
            console.error('❌ Error in recordGrades:', error);
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: null, 
                message: error.message || 'Có lỗi xảy ra khi lưu điểm', 
                meta: null 
            };
        }
    }

    @Put('update')
    @ApiOperation({ summary: 'Cập nhật điểm một học sinh cho một assessment' })
    async update(@Req() request: any, @Body() payload: UpdateGradeDto) {
        const teacherId = request.user?.teacherId;
        const data = await this.gradeService.updateGrade(teacherId, payload);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }
}
