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
exports.LeaveRequestsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leave_requests_service_1 = require("../services/leave-requests.service");
let LeaveRequestsController = class LeaveRequestsController {
    constructor(leaveRequestsService) {
        this.leaveRequestsService = leaveRequestsService;
    }
    async getLeaveRequests(query) {
        try {
            return await this.leaveRequestsService.getLeaveRequests(query);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createLeaveRequest(body) {
        try {
            return await this.leaveRequestsService.createLeaveRequest(body);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi tạo đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateLeaveRequest(id, body) {
        try {
            return await this.leaveRequestsService.updateLeaveRequest(id, body);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi cập nhật đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteLeaveRequest(id) {
        try {
            return await this.leaveRequestsService.deleteLeaveRequest(id);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi xóa đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveLeaveRequest(id, action, body) {
        try {
            return await this.leaveRequestsService.approveLeaveRequest(id, action, body.approverId, body.notes);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi xử lý đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLeaveRequestStats(teacherId) {
        try {
            return await this.leaveRequestsService.getLeaveRequestStats(teacherId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy thống kê đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLeaveRequestById(id) {
        try {
            return {
                success: true,
                data: await this.leaveRequestsService.getLeaveRequestById(id),
                message: 'Lấy chi tiết đơn xin nghỉ thành công'
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy chi tiết đơn xin nghỉ', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.LeaveRequestsController = LeaveRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách đơn xin nghỉ' }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: false, description: 'ID giáo viên' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Trạng thái (all, pending, approved, rejected)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Tìm kiếm theo loại nghỉ, lý do' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'Từ ngày (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'Đến ngày (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Trang (mặc định: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo đơn xin nghỉ mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo đơn xin nghỉ thành công' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật đơn xin nghỉ thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "updateLeaveRequest", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa đơn xin nghỉ thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "deleteLeaveRequest", null);
__decorate([
    (0, common_1.Patch)(':id/:action'),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt/từ chối đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xử lý đơn xin nghỉ thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('action')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "approveLeaveRequest", null);
__decorate([
    (0, common_1.Get)('stats/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê đơn xin nghỉ của giáo viên' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thống kê đơn xin nghỉ' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "getLeaveRequestStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết đơn xin nghỉ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết đơn xin nghỉ' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveRequestsController.prototype, "getLeaveRequestById", null);
exports.LeaveRequestsController = LeaveRequestsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Leave Requests'),
    (0, common_1.Controller)('leave-requests'),
    __metadata("design:paramtypes", [leave_requests_service_1.LeaveRequestsService])
], LeaveRequestsController);
//# sourceMappingURL=leave-requests.controller.js.map