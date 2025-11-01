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

    // ===== Grade View Management (Phải đặt trước các routes động) =====
    
    @Get('view')
    @ApiOperation({ summary: 'Lấy dữ liệu điểm số cho trang Score_view' })
    @ApiQuery({ name: 'searchTerm', required: false, description: 'Tìm kiếm theo tên hoặc mã học sinh' })
    @ApiQuery({ name: 'subjectFilter', required: false, description: 'Lọc theo môn học' })
    @ApiQuery({ name: 'classFilter', required: false, description: 'Lọc theo lớp học' })
    @ApiQuery({ name: 'testTypeFilter', required: false, description: 'Lọc theo loại kiểm tra' })
    async getGradeViewData(@Req() request: any, @Query() filters: any) {
            
        // Lấy teacherId từ userId hoặc từ request.user.teacherId
        let teacherId = request.user?.teacherId;
        
        // Nếu không có teacherId, query từ userId
        if (!teacherId && request.user?.userId) {
            console.log('teacherId not in token, querying from userId:', request.user.userId);
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
            console.log('Found teacherId:', teacherId);
        }
        
        if (!teacherId) {
            console.log('No teacher ID found');
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: {
                    students: [],
                    subjectStats: [],
                    totalStudents: 0,
                    overallAverage: 0,
                    passRate: 0
                }, 
                message: 'Không tìm thấy thông tin giáo viên', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.getGradeViewData(teacherId, filters);
            return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
        } catch (error) {
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: {
                    students: [],
                    subjectStats: [],
                    totalStudents: 0,
                    overallAverage: 0,
                    passRate: 0
                }, 
                message: error.message || 'Có lỗi xảy ra', 
                meta: null 
            };
        }
    }

    @Get('students')
    @ApiOperation({ summary: 'Lấy danh sách học sinh với điểm số chi tiết' })
    @ApiQuery({ name: 'searchTerm', required: false })
    @ApiQuery({ name: 'subjectFilter', required: false })
    @ApiQuery({ name: 'classFilter', required: false })
    @ApiQuery({ name: 'testTypeFilter', required: false })
    async getStudentGrades(@Req() request: any, @Query() filters: any) {
        let teacherId = request.user?.teacherId;
        
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        
        if (!teacherId) {
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: [], 
                message: 'Không tìm thấy thông tin giáo viên', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.getStudentGrades(teacherId, filters);
            return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
        } catch (error) {
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: error.message || 'Có lỗi xảy ra', 
                meta: null 
            };
        }
    }

    @Get('subject-stats')
    @ApiOperation({ summary: 'Lấy thống kê theo môn học' })
    async getSubjectStats(@Req() request: any) {
        let teacherId = request.user?.teacherId;
        
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        
        if (!teacherId) {
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: [], 
                message: 'Không tìm thấy thông tin giáo viên', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.getSubjectStats(teacherId);
            return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
        } catch (error) {
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: error.message || 'Có lỗi xảy ra', 
                meta: null 
            };
        }
    }

    // ===== Original Grade Management =====
    
    @Get('class-students')
    @ApiOperation({ summary: 'Lấy danh sách học sinh của lớp (kèm điểm TB hiện tại)' })
    @ApiQuery({ name: 'classId', required: true, description: 'ID lớp (UUID)' })
    async getStudents(@Req() request: any, @Query('classId') classId: string) {
        
        const userId = request.user?.userId;
        
        if (!userId) {
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: [], 
                message: 'Không tìm thấy thông tin người dùng', 
                meta: null 
            };
        }
        
        try {
            const data = await this.gradeService.getStudentsOfClass(userId, classId);
            
            return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
        } catch (error) {
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
        const userId = request.user?.userId;
        const data = await this.gradeService.listAssessments(userId, classId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Get('assessment-types')
    @ApiOperation({ summary: 'Danh sách loại kiểm tra (distinct type) trong các lớp giáo viên đang dạy hoặc theo class' })
    @ApiQuery({ name: 'classId', required: false })
    async getAssessmentTypes(@Req() request: any, @Query('classId') classId?: string) {
        const userId = request.user?.userId;
        const data = await this.gradeService.listAssessmentTypes(userId, classId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Get('exam-types-config')
    @ApiOperation({ summary: 'Lấy cấu hình đầy đủ của exam types từ SystemSetting (bao gồm maxScore, description)' })
    async getExamTypesConfig(@Req() request: any) {
        const userId = request.user?.userId;
        const data = await this.gradeService.getExamTypesConfig(userId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Get('assessments/:assessmentId/grades')
    @ApiOperation({ summary: 'Lấy điểm theo assessment' })
    async getAssessmentGrades(@Req() request: any, @Param('assessmentId') assessmentId: string) {
        const userId = request.user?.userId;
        const data = await this.gradeService.getAssessmentGrades(userId, assessmentId);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Post('record')
    @ApiOperation({ summary: 'Tạo assessment và ghi điểm hàng loạt' })
    async record(@Req() request: any, @Body() payload: RecordGradesDto) {
        
        // Không còn validate maxScore cố định = 10, vì maxScore giờ lấy từ SystemSetting
        // Backend service sẽ tự động query SystemSetting để lấy maxScore theo assessmentType
        
        const userId = request.user?.userId;
        
        // Validate userId
        if (!userId) {
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
            
            return { success: true, status: HttpStatus.CREATED, data, message: 'Đã tạo assessment và ghi điểm', meta: null };
        } catch (error) {
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
        const userId = request.user?.userId;
        const data = await this.gradeService.updateGrade(userId, payload);
        return { success: true, status: HttpStatus.OK, data, message: 'OK', meta: null };
    }

    @Put('students/update')
    @ApiOperation({ summary: 'Cập nhật điểm số của học sinh' })
    async updateStudentGrade(@Req() request: any, @Body() payload: { studentId: string; assessmentId: string; score: number }) {
        let teacherId = request.user?.teacherId;
        
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        
        if (!teacherId) {
            return { 
                success: false, 
                status: HttpStatus.UNAUTHORIZED, 
                data: null, 
                message: 'Không tìm thấy thông tin giáo viên', 
                meta: null 
            };
        }
        
        try {
            await this.gradeService.updateStudentGrade(teacherId, payload);
            return { success: true, status: HttpStatus.OK, data: null, message: 'Cập nhật điểm thành công', meta: null };
        } catch (error) {
            return { 
                success: false, 
                status: HttpStatus.INTERNAL_SERVER_ERROR, 
                data: null, 
                message: error.message || 'Có lỗi xảy ra', 
                meta: null 
            };
        }
    }
}
