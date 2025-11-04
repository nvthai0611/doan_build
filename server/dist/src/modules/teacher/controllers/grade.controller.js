"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const grade_service_1 = require("../services/grade.service");
const record_grades_dto_1 = require("../dto/grade/record-grades.dto");
const update_grade_dto_1 = require("../dto/grade/update-grade.dto");
let GradeController = class GradeController {
    constructor(gradeService) {
        this.gradeService = gradeService;
    }
    async getGradeViewData(request, filters) {
        let teacherId = request.user?.teacherId;
        if (!teacherId && request.user?.userId) {
            console.log('teacherId not in token, querying from userId:', request.user.userId);
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
            console.log('Found teacherId:', teacherId);
        }
        if (!teacherId) {
            console.log('No teacher ID found');
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
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
            return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
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
    async getStudentGrades(request, filters) {
        let teacherId = request.user?.teacherId;
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        if (!teacherId) {
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
                data: [],
                message: 'Không tìm thấy thông tin giáo viên',
                meta: null
            };
        }
        try {
            const data = await this.gradeService.getStudentGrades(teacherId, filters);
            return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: [],
                message: error.message || 'Có lỗi xảy ra',
                meta: null
            };
        }
    }
    async getSubjectStats(request) {
        let teacherId = request.user?.teacherId;
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        if (!teacherId) {
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
                data: [],
                message: 'Không tìm thấy thông tin giáo viên',
                meta: null
            };
        }
        try {
            const data = await this.gradeService.getSubjectStats(teacherId);
            return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: [],
                message: error.message || 'Có lỗi xảy ra',
                meta: null
            };
        }
    }
    async getStudents(request, classId) {
        const userId = request.user?.userId;
        if (!userId) {
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
                data: [],
                message: 'Không tìm thấy thông tin người dùng',
                meta: null
            };
        }
        try {
            const data = await this.gradeService.getStudentsOfClass(userId, classId);
            return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: [],
                message: error.message || 'Có lỗi xảy ra',
                meta: null
            };
        }
    }
    async getAssessments(request, classId) {
        const userId = request.user?.userId;
        const data = await this.gradeService.listAssessments(userId, classId);
        return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
    }
    async getAssessmentTypes(request, classId) {
        const userId = request.user?.userId;
        const data = await this.gradeService.listAssessmentTypes(userId, classId);
        return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
    }
    async getExamTypesConfig(request) {
        const userId = request.user?.userId;
        const data = await this.gradeService.getExamTypesConfig(userId);
        return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
    }
    async getAssessmentGrades(request, assessmentId) {
        const userId = request.user?.userId;
        const data = await this.gradeService.getAssessmentGrades(userId, assessmentId);
        return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
    }
    async record(request, payload) {
        const userId = request.user?.userId;
        if (!userId) {
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
                data: null,
                message: 'ID không hợp lệ',
                meta: null
            };
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return {
                success: false,
                status: common_1.HttpStatus.BAD_REQUEST,
                data: null,
                message: 'ID không hợp lệ',
                meta: null
            };
        }
        try {
            const data = await this.gradeService.recordGrades(userId, payload);
            return { success: true, status: common_1.HttpStatus.CREATED, data, message: 'Đã tạo assessment và ghi điểm', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                message: error.message || 'Có lỗi xảy ra khi lưu điểm',
                meta: null
            };
        }
    }
    async update(request, payload) {
        const userId = request.user?.userId;
        const data = await this.gradeService.updateGrade(userId, payload);
        return { success: true, status: common_1.HttpStatus.OK, data, message: 'OK', meta: null };
    }
    async updateStudentGrade(request, payload) {
        let teacherId = request.user?.teacherId;
        if (!teacherId && request.user?.userId) {
            teacherId = await this.gradeService.getTeacherIdFromUserId(request.user.userId);
        }
        if (!teacherId) {
            return {
                success: false,
                status: common_1.HttpStatus.UNAUTHORIZED,
                data: null,
                message: 'Không tìm thấy thông tin giáo viên',
                meta: null
            };
        }
        try {
            await this.gradeService.updateStudentGrade(teacherId, payload);
            return { success: true, status: common_1.HttpStatus.OK, data: null, message: 'Cập nhật điểm thành công', meta: null };
        }
        catch (error) {
            return {
                success: false,
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                message: error.message || 'Có lỗi xảy ra',
                meta: null
            };
        }
    }
};
exports.GradeController = GradeController;
__decorate([
    (0, common_1.Get)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy dữ liệu điểm số cho trang Score_view' }),
    (0, swagger_1.ApiQuery)({ name: 'searchTerm', required: false, description: 'Tìm kiếm theo tên hoặc mã học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'subjectFilter', required: false, description: 'Lọc theo môn học' }),
    (0, swagger_1.ApiQuery)({ name: 'classFilter', required: false, description: 'Lọc theo lớp học' }),
    (0, swagger_1.ApiQuery)({ name: 'testTypeFilter', required: false, description: 'Lọc theo loại kiểm tra' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getGradeViewData", null);
__decorate([
    (0, common_1.Get)('students'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học sinh với điểm số chi tiết' }),
    (0, swagger_1.ApiQuery)({ name: 'searchTerm', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'subjectFilter', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'classFilter', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'testTypeFilter', required: false }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getStudentGrades", null);
__decorate([
    (0, common_1.Get)('subject-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê theo môn học' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getSubjectStats", null);
__decorate([
    (0, common_1.Get)('class-students'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học sinh của lớp (kèm điểm TB hiện tại)' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: true, description: 'ID lớp (UUID)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('assessments'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách assessments của lớp' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: true }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getAssessments", null);
__decorate([
    (0, common_1.Get)('assessment-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách loại kiểm tra (distinct type) trong các lớp giáo viên đang dạy hoặc theo class' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getAssessmentTypes", null);
__decorate([
    (0, common_1.Get)('exam-types-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy cấu hình đầy đủ của exam types từ SystemSetting (bao gồm maxScore, description)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getExamTypesConfig", null);
__decorate([
    (0, common_1.Get)('assessments/:assessmentId/grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy điểm theo assessment' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('assessmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "getAssessmentGrades", null);
__decorate([
    (0, common_1.Post)('record'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo assessment và ghi điểm hàng loạt' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, record_grades_dto_1.RecordGradesDto]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "record", null);
__decorate([
    (0, common_1.Put)('update'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật điểm một học sinh cho một assessment' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_grade_dto_1.UpdateGradeDto]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('students/update'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật điểm số của học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GradeController.prototype, "updateStudentGrade", null);
exports.GradeController = GradeController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Grades'),
    (0, common_1.Controller)('grades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [grade_service_1.GradeService])
], GradeController);
//# sourceMappingURL=grade.controller.js.map