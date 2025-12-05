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
exports.ClassManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const class_management_service_1 = require("../services/class-management.service");
const swagger_1 = require("@nestjs/swagger");
const response_class_dto_1 = require("../dto/classes/response-class.dto");
const query_class_dto_1 = require("../dto/classes/query-class.dto");
let ClassManagementController = class ClassManagementController {
    constructor(classManagementService) {
        this.classManagementService = classManagementService;
    }
    async getClassDetails(request, query) {
        if (!query.teacherClassAssignmentId) {
            throw new common_1.HttpException('Class ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const teacherId = request.user?.teacherId;
        const classDetail = await this.classManagementService.getClassDetail(teacherId, query.teacherClassAssignmentId);
        return {
            success: true,
            status: common_1.HttpStatus.OK,
            data: classDetail,
            message: 'Lấy chi tiết lớp học thành công',
            meta: null,
        };
    }
    async getClassByTeacherId(request, queryParams) {
        const tokenUser = request.user;
        const teacherId = tokenUser?.teacherId;
        const pageNum = parseInt(queryParams.page) || 1;
        const limitNum = parseInt(queryParams.limit) || 10;
        const maxLimit = 100;
        const validLimit = limitNum > maxLimit ? maxLimit : limitNum;
        const validPage = pageNum < 1 ? 1 : pageNum;
        const result = await this.classManagementService.getClassByTeacherId(teacherId, queryParams.status, validPage, validLimit, queryParams.search);
        return {
            success: true,
            status: common_1.HttpStatus.OK,
            data: result.data,
            message: 'Lấy danh sách lớp học thành công',
            meta: {
                pagination: result.pagination,
                filters: result.filters
            },
        };
    }
    async getCountByStatus(request) {
        const teacherId = request.user?.teacherId;
        const countByStatus = await this.classManagementService.getCountByStatus(teacherId);
        return {
            success: true,
            status: common_1.HttpStatus.OK,
            data: countByStatus,
            message: 'Lấy số lượng lớp học theo trạng thái thành công',
            meta: null,
        };
    }
    async getHistoryAttendanceOfClass(classId, req) {
        const teacherId = req.user?.teacherId;
        const historyAttendance = await this.classManagementService.getHistoryAttendanceOfClass(classId, teacherId);
        return {
            success: true,
            message: 'Lấy lịch sử điểm danh thành công',
            status: common_1.HttpStatus.OK,
            data: historyAttendance,
        };
    }
};
exports.ClassManagementController = ClassManagementController;
__decorate([
    (0, common_1.Get)('classes/details'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết lớp học theo ID lớp và ID giáo viên' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: true, description: 'ID của lớp học (UUID)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassDetails", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách lớp học theo ID giáo viên với filter và search',
        description: 'API hỗ trợ phân trang, tìm kiếm và lọc theo trạng thái, ngày, ca học'
    }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Trạng thái lớp học', enum: ['all', 'active', 'completed', 'draft', 'cancelled'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Từ khóa tìm kiếm (tên lớp, mã lớp)' }),
    (0, swagger_1.ApiQuery)({ name: 'day', required: false, description: 'Ngày trong tuần', enum: ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: false, description: 'Ca học', enum: ['all', 'morning', 'afternoon', 'evening'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Số trang', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Số lượng items per page', type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách lớp học thành công',
        type: response_class_dto_1.ClassesListResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'ID giáo viên không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy lớp học'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Lỗi server'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_class_dto_1.ClassQueryDto]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getClassByTeacherId", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy số lượng lớp học theo trạng thái' }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy số lượng lớp học theo trạng thái thành công',
        type: response_class_dto_1.CountByStatusResponseDto
    }),
    (0, common_1.Get)('classes/count-by-status'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getCountByStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử điểm danh của lớp học theo ID phân công lớp học của giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'teacherClassAssignmentId', description: 'Đây là Id phân công lớp học của giáo viên' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy lịch sử điểm danh thành công',
    }),
    (0, common_1.Get)('classes/:classId/attendance-history'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassManagementController.prototype, "getHistoryAttendanceOfClass", null);
exports.ClassManagementController = ClassManagementController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Classes'),
    (0, common_1.Controller)('class-management'),
    __metadata("design:paramtypes", [class_management_service_1.ClassManagementService])
], ClassManagementController);
//# sourceMappingURL=class-management.controller.js.map