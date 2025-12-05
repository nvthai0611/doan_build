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
exports.SessionRequestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_request_service_1 = require("../services/session-request.service");
const create_session_request_dto_1 = require("../dto/session-request/create-session-request.dto");
const session_request_response_dto_1 = require("../dto/session-request/session-request-response.dto");
const session_request_filters_dto_1 = require("../dto/session-request/session-request-filters.dto");
let SessionRequestController = class SessionRequestController {
    constructor(sessionRequestService) {
        this.sessionRequestService = sessionRequestService;
    }
    async createSessionRequest(req, dto) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionRequestService.createSessionRequest(teacherId, dto);
            return {
                success: true,
                data: result,
                message: 'Gửi yêu cầu tạo buổi học thành công. Vui lòng chờ chủ trung tâm duyệt.',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi tạo yêu cầu tạo buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMySessionRequests(req, filters) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionRequestService.getMySessionRequests(teacherId, filters);
            return {
                success: true,
                data: result,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                },
                message: 'Lấy danh sách yêu cầu tạo buổi học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu tạo buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionRequestDetail(req, requestId) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionRequestService.getSessionRequestDetail(teacherId, requestId);
            if (!result) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy yêu cầu tạo buổi học hoặc không có quyền truy cập',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result,
                message: 'Lấy chi tiết yêu cầu tạo buổi học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy chi tiết yêu cầu tạo buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelSessionRequest(req, requestId) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionRequestService.cancelSessionRequest(teacherId, requestId);
            if (!result) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result,
                message: 'Hủy yêu cầu tạo buổi học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi hủy yêu cầu tạo buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SessionRequestController = SessionRequestController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo yêu cầu tạo buổi học mới' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tạo yêu cầu thành công',
        type: session_request_response_dto_1.SessionRequestResponseDto
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_session_request_dto_1.CreateSessionRequestDto]),
    __metadata("design:returntype", Promise)
], SessionRequestController.prototype, "createSessionRequest", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách yêu cầu tạo buổi học của giáo viên' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách yêu cầu thành công'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, session_request_filters_dto_1.SessionRequestFiltersDto]),
    __metadata("design:returntype", Promise)
], SessionRequestController.prototype, "getMySessionRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy chi tiết yêu cầu thành công',
        type: session_request_response_dto_1.SessionRequestResponseDto
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionRequestController.prototype, "getSessionRequestDetail", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Hủy yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của yêu cầu tạo buổi học' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hủy yêu cầu thành công',
        type: session_request_response_dto_1.SessionRequestResponseDto
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionRequestController.prototype, "cancelSessionRequest", null);
exports.SessionRequestController = SessionRequestController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Session Request'),
    (0, common_1.Controller)('session-request'),
    __metadata("design:paramtypes", [session_request_service_1.SessionRequestService])
], SessionRequestController);
//# sourceMappingURL=session-request.controller.js.map