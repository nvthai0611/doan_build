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
exports.SessionController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_service_1 = require("../services/session.service");
const session_detail_response_dto_1 = require("../dto/session/session-detail-response.dto");
const reschedule_session_dto_1 = require("../dto/session/reschedule-session.dto");
const create_session_dto_1 = require("../dto/session/create-session.dto");
let SessionController = class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getSessionDetail(req, sessionId) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionService.getSessionDetail(teacherId, sessionId);
            if (!result) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy buổi học hoặc không có quyền truy cập',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result,
                message: 'Lấy chi tiết buổi học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy chi tiết buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSession(req, dto) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionService.createSession(teacherId, dto);
            return {
                success: true,
                data: result,
                message: 'Tạo buổi học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new Error(error.message);
        }
    }
    async rescheduleSession(req, sessionId, rescheduleDto) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionService.rescheduleSession(teacherId, sessionId, rescheduleDto);
            if (!result) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy buổi học hoặc không có quyền dời lịch',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result,
                message: 'Yêu cầu dời lịch buổi học đã được tạo thành công. Vui lòng chờ phê duyệt.',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi tạo yêu cầu dời lịch buổi học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionStudents(req, sessionId) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.sessionService.getSessionStudents(teacherId, sessionId);
            return {
                success: true,
                data: result,
                message: 'Lấy danh sách học viên thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách học viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy chi tiết buổi học thành công',
        type: session_detail_response_dto_1.SessionDetailResponseDto
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionDetail", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo buổi học mới cho lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tạo buổi học thành công' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)(':id/reschedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo yêu cầu dời lịch buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tạo yêu cầu dời lịch thành công',
        type: session_detail_response_dto_1.SessionDetailResponseDto
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reschedule_session_dto_1.RescheduleSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "rescheduleSession", null);
__decorate([
    (0, common_1.Get)(':id/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học viên trong buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách học viên thành công'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionStudents", null);
exports.SessionController = SessionController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Session'),
    (0, common_1.Controller)('session'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map