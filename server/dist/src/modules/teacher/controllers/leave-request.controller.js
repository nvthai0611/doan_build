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
exports.LeaveRequestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leave_request_service_1 = require("../services/leave-request.service");
const leave_request_dto_1 = require("../dto/leave-request/leave-request.dto");
let LeaveRequestController = class LeaveRequestController {
    constructor(leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }
    async getAffectedSessions(req, query) {
        try {
            const teacherId = req.user?.teacherId;
            const data = await this.leaveRequestService.getAffectedSessions(teacherId, query.startDate, query.endDate);
            return {
                success: true,
                data: data,
                message: 'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getReplacementTeachers(req, query) {
        try {
            const teacherId = req.user?.teacherId;
            const data = await this.leaveRequestService.getReplacementTeachers(teacherId, query.sessionId, query.date, query.time);
            return {
                success: true,
                data: data,
                message: 'Lấy danh sách giáo viên thay thế thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách giáo viên thay thế',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMyLeaveRequests(req, page, limit, status, requestType) {
        try {
            const teacherId = req.user?.teacherId;
            const data = await this.leaveRequestService.getMyLeaveRequests(teacherId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status,
                requestType,
            });
            return {
                success: true,
                data: data,
                message: 'Lấy danh sách đơn thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách đơn',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createLeaveRequest(req, body) {
        try {
            const teacherId = req.user?.teacherId;
            const data = await this.leaveRequestService.createLeaveRequest(teacherId, body, body.affectedSessions, req.user?.userId);
            return {
                success: true,
                data: data,
                message: 'Yêu cầu nghỉ đã được tạo thành công',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async cancelLeaveRequest(req, id) {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin giáo viên' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            await this.leaveRequestService.cancelLeaveRequest(teacherId, id);
            return {
                success: true,
                message: 'Hủy đơn xin nghỉ thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi hủy đơn xin nghỉ',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.LeaveRequestController = LeaveRequestController;
__decorate([
    (0, common_1.Get)('affected-sessions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách buổi học bị ảnh hưởng bởi khoảng thời gian nghỉ',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách buổi học',
        type: leave_request_dto_1.AffectedSessionItemDto,
        isArray: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Thiếu hoặc sai tham số' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, leave_request_dto_1.AffectedSessionsQueryDto]),
    __metadata("design:returntype", Promise)
], LeaveRequestController.prototype, "getAffectedSessions", null);
__decorate([
    (0, common_1.Get)('replacement-teachers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách giáo viên có thể thay thế cho buổi học',
        description: 'API lấy danh sách giáo viên có thể dạy thay cho một buổi học cụ thể',
    }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: true, description: 'ID buổi học' }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: true,
        description: 'Ngày học (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'time',
        required: true,
        description: 'Khung giờ (HH:MM-HH:MM)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách giáo viên thay thế',
        type: leave_request_dto_1.ReplacementTeacherDto,
        isArray: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Thiếu hoặc sai tham số' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy buổi học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, leave_request_dto_1.ReplacementTeachersQueryDto]),
    __metadata("design:returntype", Promise)
], LeaveRequestController.prototype, "getReplacementTeachers", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đơn của giáo viên' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Trang hiện tại' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Số lượng mỗi trang' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Trạng thái đơn' }),
    (0, swagger_1.ApiQuery)({ name: 'requestType', required: false, description: 'Loại đơn' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách đơn của giáo viên' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('requestType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveRequestController.prototype, "getMyLeaveRequests", null);
__decorate([
    (0, common_1.Post)('create-leave-request'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo yêu cầu nghỉ' }),
    (0, swagger_1.ApiBody)({ type: leave_request_dto_1.LeaveRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Yêu cầu nghỉ đã được tạo thành công',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Thiếu hoặc sai tham số' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, leave_request_dto_1.LeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeaveRequestController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Hủy đơn xin nghỉ' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hủy đơn thành công',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Chỉ có thể hủy đơn đang chờ duyệt',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy đơn xin nghỉ',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeaveRequestController.prototype, "cancelLeaveRequest", null);
exports.LeaveRequestController = LeaveRequestController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Leave Requests'),
    (0, common_1.Controller)('leave-request'),
    __metadata("design:paramtypes", [leave_request_service_1.LeaveRequestService])
], LeaveRequestController);
//# sourceMappingURL=leave-request.controller.js.map