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
exports.ScheduleChangeAdminController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedule_change_service_1 = require("../services/schedule-change.service");
let ScheduleChangeAdminController = class ScheduleChangeAdminController {
    constructor(scheduleChangeService) {
        this.scheduleChangeService = scheduleChangeService;
    }
    async getScheduleChanges(query) {
        try {
            return await this.scheduleChangeService.getScheduleChanges(query);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách yêu cầu dời lịch', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getScheduleChangeById(id) {
        try {
            const data = await this.scheduleChangeService.getScheduleChangeById(id);
            return {
                success: true,
                data,
                message: 'Lấy chi tiết yêu cầu dời lịch thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy chi tiết yêu cầu dời lịch', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleScheduleChange(id, action, body) {
        try {
            const data = await this.scheduleChangeService.handleScheduleChange(id, action, body?.notes);
            return {
                success: true,
                data,
                message: action === 'approve' ? 'Đã duyệt yêu cầu dời lịch' : 'Đã từ chối yêu cầu dời lịch',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi xử lý yêu cầu dời lịch', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScheduleChangeAdminController = ScheduleChangeAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách yêu cầu dời lịch' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeAdminController.prototype, "getScheduleChanges", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết yêu cầu dời lịch' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID yêu cầu' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleChangeAdminController.prototype, "getScheduleChangeById", null);
__decorate([
    (0, common_1.Patch)(':id/:action'),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt/Từ chối yêu cầu dời lịch' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID yêu cầu' }),
    (0, swagger_1.ApiParam)({ name: 'action', description: 'approve | reject' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xử lý yêu cầu dời lịch' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('action')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeAdminController.prototype, "handleScheduleChange", null);
exports.ScheduleChangeAdminController = ScheduleChangeAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Schedule Changes'),
    (0, common_1.Controller)('schedule-changes'),
    __metadata("design:paramtypes", [schedule_change_service_1.ScheduleChangeAdminService])
], ScheduleChangeAdminController);
//# sourceMappingURL=schedule-change.controller.js.map