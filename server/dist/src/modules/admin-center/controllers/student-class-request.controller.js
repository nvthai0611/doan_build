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
exports.StudentClassRequestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const student_class_request_service_1 = require("../services/student-class-request.service");
const student_class_request_dto_1 = require("../dto/student-class-request.dto");
let StudentClassRequestController = class StudentClassRequestController {
    constructor(studentClassRequestService) {
        this.studentClassRequestService = studentClassRequestService;
    }
    async getAllRequests(query) {
        try {
            return await this.studentClassRequestService.getAllRequests({
                status: query.status,
                classId: query.classId,
                studentId: query.studentId,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 20,
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRequestById(id) {
        try {
            return await this.studentClassRequestService.getRequestById(id);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin yêu cầu',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveRequest(id, body) {
        try {
            const overrideCapacity = body?.overrideCapacity === true;
            console.log('Controller received overrideCapacity:', body?.overrideCapacity, 'parsed as:', overrideCapacity);
            return await this.studentClassRequestService.approveRequest(id, overrideCapacity);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi chấp nhận yêu cầu',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async rejectRequest(id, dto) {
        try {
            return await this.studentClassRequestService.rejectRequest(id, dto.reason);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi từ chối yêu cầu',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentClassRequestController = StudentClassRequestController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('center_owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả yêu cầu tham gia lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_class_request_dto_1.GetStudentClassRequestsDto]),
    __metadata("design:returntype", Promise)
], StudentClassRequestController.prototype, "getAllRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('center_owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết yêu cầu tham gia lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy chi tiết thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy yêu cầu' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentClassRequestController.prototype, "getRequestById", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('center_owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Chấp nhận yêu cầu tham gia lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chấp nhận yêu cầu thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy yêu cầu' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Yêu cầu đã được xử lý hoặc lớp đã đầy',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentClassRequestController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('center_owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Từ chối yêu cầu tham gia lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Từ chối yêu cầu thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy yêu cầu' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Yêu cầu đã được xử lý' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, student_class_request_dto_1.RejectRequestDto]),
    __metadata("design:returntype", Promise)
], StudentClassRequestController.prototype, "rejectRequest", null);
exports.StudentClassRequestController = StudentClassRequestController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Student Class Requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('student-class-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [student_class_request_service_1.StudentClassRequestService])
], StudentClassRequestController);
//# sourceMappingURL=student-class-request.controller.js.map