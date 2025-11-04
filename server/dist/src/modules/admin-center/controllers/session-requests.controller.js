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
exports.SessionRequestsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_requests_service_1 = require("../services/session-requests.service");
let SessionRequestsController = class SessionRequestsController {
    constructor(sessionRequestsService) {
        this.sessionRequestsService = sessionRequestsService;
    }
    async getSessionRequests(query) {
        try {
            return await this.sessionRequestsService.getSessionRequests(query);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách yêu cầu tạo buổi học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSessionRequest(body) {
        try {
            return await this.sessionRequestsService.createSessionRequest(body);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi tạo yêu cầu tạo buổi học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveSessionRequest(id, action, body) {
        try {
            return await this.sessionRequestsService.approveSessionRequest(id, action, body.approverId, body.notes);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi xử lý yêu cầu tạo buổi học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionRequestById(id) {
        try {
            return {
                success: true,
                data: await this.sessionRequestsService.getSessionRequestById(id),
                message: 'Lấy chi tiết yêu cầu tạo buổi học thành công'
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy chi tiết yêu cầu tạo buổi học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SessionRequestsController = SessionRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: false, description: 'ID giáo viên' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'ID lớp học' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Trạng thái (all, pending, approved, rejected)' }),
    (0, swagger_1.ApiQuery)({ name: 'requestType', required: false, description: 'Loại yêu cầu (makeup_session, extra_session)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Tìm kiếm theo lý do' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'Từ ngày (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'Đến ngày (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Trang (mặc định: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Số lượng mỗi trang (mặc định: 10)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionRequestsController.prototype, "getSessionRequests", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo yêu cầu tạo buổi học mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo yêu cầu tạo buổi học thành công' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionRequestsController.prototype, "createSessionRequest", null);
__decorate([
    (0, common_1.Patch)(':id/:action'),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt/từ chối yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xử lý yêu cầu tạo buổi học thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('action')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SessionRequestsController.prototype, "approveSessionRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết yêu cầu tạo buổi học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionRequestsController.prototype, "getSessionRequestById", null);
exports.SessionRequestsController = SessionRequestsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Session Requests'),
    (0, common_1.Controller)('session-requests'),
    __metadata("design:paramtypes", [session_requests_service_1.SessionRequestsService])
], SessionRequestsController);
//# sourceMappingURL=session-requests.controller.js.map