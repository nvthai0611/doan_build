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
exports.StudentManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const student_management_service_1 = require("../services/student-management.service");
const swagger_1 = require("@nestjs/swagger");
let StudentManagementController = class StudentManagementController {
    constructor(service) {
        this.service = service;
    }
    async getChildren(req, query) {
        const userId = req.user?.userId;
        const result = await this.service.getChildrenForParent(userId, query);
        return result;
    }
    async getChildDetail(req, childId) {
        const userId = req.user?.userId;
        const result = await this.service.getChildDetailForParent(userId, childId);
        return result;
    }
    async getChildMetrics(req, childId) {
        const userId = req.user?.userId;
        return await this.service.getChildMetricsForParent(userId, childId);
    }
    async getChildSchedule(req, childId, startDate, endDate) {
        const userId = req.user?.userId;
        return await this.service.getChildScheduleForParent(userId, childId, startDate, endDate);
    }
    async getChildGrades(req, childId, classId) {
        const userId = req.user?.userId;
        return await this.service.getChildGradesForParent(userId, childId, classId);
    }
    async getChildAttendance(req, childId, classId, startDate, endDate) {
        const userId = req.user?.userId;
        return await this.service.getChildAttendanceForParent(userId, childId, { classId, startDate, endDate });
    }
    async getClassRanking(req, childId, classId) {
        const userId = req.user?.userId;
        return await this.service.getClassRankingForParent(userId, childId, classId);
    }
};
exports.StudentManagementController = StudentManagementController;
__decorate([
    (0, common_1.Get)('children'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách con của phụ huynh đang đăng nhập' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'grade', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'enrollmentStatus', required: false, enum: ['enrolled', 'not_enrolled', 'all'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Get)('children/:childId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết học sinh của phụ huynh đang đăng nhập' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildDetail", null);
__decorate([
    (0, common_1.Get)('children/:childId/metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Thành tích học tập của học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildMetrics", null);
__decorate([
    (0, common_1.Get)('children/:childId/schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch học của học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildSchedule", null);
__decorate([
    (0, common_1.Get)('children/:childId/grades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Điểm số của học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Lọc theo lớp học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildGrades", null);
__decorate([
    (0, common_1.Get)('children/:childId/attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch sử điểm danh của học sinh' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Lọc theo lớp học' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Ngày bắt đầu' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Ngày kết thúc' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Query)('classId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getChildAttendance", null);
__decorate([
    (0, common_1.Get)('children/:childId/class-ranking/:classId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Xếp hạng của học sinh trong một lớp cụ thể' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('childId')),
    __param(2, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getClassRanking", null);
exports.StudentManagementController = StudentManagementController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Student Management'),
    (0, common_1.Controller)('student-management'),
    __metadata("design:paramtypes", [student_management_service_1.StudentManagementService])
], StudentManagementController);
//# sourceMappingURL=student-management.controller.js.map