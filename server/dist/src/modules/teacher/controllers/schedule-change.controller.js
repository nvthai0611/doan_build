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
exports.ScheduleChangeController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const schedule_change_service_1 = require("../services/schedule-change.service");
const create_schedule_change_dto_1 = require("../dto/schedule-change/create-schedule-change.dto");
const schedule_change_filters_dto_1 = require("../dto/schedule-change/schedule-change-filters.dto");
let ScheduleChangeController = class ScheduleChangeController {
    constructor(scheduleChangeService) {
        this.scheduleChangeService = scheduleChangeService;
    }
    async createScheduleChange(createDto, req) {
        const teacherId = req.user.teacherId;
        const scheduleChange = await this.scheduleChangeService.createScheduleChange(createDto, teacherId);
        return {
            success: true,
            message: 'Yêu cầu dời lịch đã được tạo thành công',
            data: scheduleChange,
        };
    }
    async getMyScheduleChanges(filters, req) {
        const teacherId = req.user.teacherId;
        const result = await this.scheduleChangeService.getMyScheduleChanges(teacherId, filters);
        return {
            success: true,
            data: result.data,
            meta: result.meta,
        };
    }
    async getScheduleChangeDetail(id, req) {
        const teacherId = req.user.teacherId;
        const scheduleChange = await this.scheduleChangeService.getScheduleChangeDetail(id, teacherId);
        return {
            success: true,
            data: scheduleChange,
        };
    }
    async cancelScheduleChange(id, req) {
        const teacherId = req.user.teacherId;
        await this.scheduleChangeService.cancelScheduleChange(id, teacherId);
        return {
            success: true,
            message: 'Yêu cầu dời lịch đã được hủy thành công',
        };
    }
};
exports.ScheduleChangeController = ScheduleChangeController;
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_change_dto_1.CreateScheduleChangeDto, Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeController.prototype, "createScheduleChange", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_change_filters_dto_1.ScheduleChangeFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeController.prototype, "getMyScheduleChanges", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeController.prototype, "getScheduleChangeDetail", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleChangeController.prototype, "cancelScheduleChange", null);
exports.ScheduleChangeController = ScheduleChangeController = __decorate([
    (0, common_1.Controller)('schedule-changes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [schedule_change_service_1.ScheduleChangeService])
], ScheduleChangeController);
//# sourceMappingURL=schedule-change.controller.js.map