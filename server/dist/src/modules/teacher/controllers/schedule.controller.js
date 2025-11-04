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
exports.ScheduleController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedule_service_1 = require("../services/schedule.service");
const update_schedule_status_dto_1 = require("../dto/schedule/update-schedule-status.dto");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async getWeeklySchedule(req, weekStart) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.scheduleService.getWeeklySchedule(teacherId, weekStart);
            return {
                success: true,
                data: result,
                message: 'Lấy lịch dạy theo tuần thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy lịch dạy theo tuần',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMonthlySchedule(req, year, month) {
        try {
            const teacherId = req.user.teacherId;
            const result = await this.scheduleService.getMonthlySchedule(teacherId, year, month);
            return {
                success: true,
                data: result,
                message: 'Lấy lịch dạy theo tháng thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy lịch dạy theo tháng',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getScheduleDetail(req, scheduleId) {
        try {
            const teacherId = req.user.id;
            const result = await this.scheduleService.getScheduleDetail(teacherId, scheduleId);
            return {
                success: true,
                data: result,
                message: 'Lấy chi tiết buổi dạy thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy chi tiết buổi dạy',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateScheduleStatus(req, scheduleId, updateStatusDto) {
        try {
            const teacherId = req.user.id;
            const result = await this.scheduleService.updateScheduleStatus(teacherId, scheduleId, updateStatusDto);
            return {
                success: true,
                data: result,
                message: 'Cập nhật trạng thái buổi dạy thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật trạng thái buổi dạy',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Get)('weekly'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch dạy theo tuần' }),
    (0, swagger_1.ApiQuery)({
        name: 'weekStart',
        description: 'Ngày bắt đầu tuần (YYYY-MM-DD)',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('weekStart')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getWeeklySchedule", null);
__decorate([
    (0, common_1.Get)('monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch dạy theo tháng' }),
    (0, swagger_1.ApiQuery)({ name: 'year', description: 'Năm' }),
    (0, swagger_1.ApiQuery)({ name: 'month', description: 'Tháng (1-12)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getMonthlySchedule", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết một buổi dạy' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi dạy' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getScheduleDetail", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái buổi dạy' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi dạy' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_schedule_status_dto_1.UpdateScheduleStatusDto]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "updateScheduleStatus", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Schedule'),
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map