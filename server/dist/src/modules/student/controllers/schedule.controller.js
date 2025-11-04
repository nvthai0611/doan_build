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
const schedule_filters_dto_1 = require("../dto/schedule-filters.dto");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async getWeeklySchedule(req, weekStart) {
        try {
            const studentId = req.user?.studentId;
            if (!studentId) {
                throw new common_1.HttpException({ success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!weekStart) {
                throw new common_1.HttpException({ success: false, error: 'Week start date is required', message: 'Ngày bắt đầu tuần là bắt buộc' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const data = await this.scheduleService.getWeeklySchedule(studentId, weekStart);
            return { success: true, data, message: 'Lấy lịch học theo tuần thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, error: error.message, message: 'Có lỗi khi lấy lịch tuần' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMonthlySchedule(req, year, month) {
        try {
            const studentId = req.user?.studentId;
            if (!studentId) {
                throw new common_1.HttpException({ success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!year || !month || month < 1 || month > 12) {
                throw new common_1.HttpException({ success: false, error: 'Invalid year or month', message: 'Năm hoặc tháng không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const data = await this.scheduleService.getMonthlySchedule(studentId, year, month);
            return { success: true, data, message: 'Lấy lịch học theo tháng thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, error: error.message, message: 'Có lỗi khi lấy lịch tháng' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSchedule(req, filters) {
        try {
            const studentId = req.user?.studentId;
            if (!studentId) {
                throw new common_1.HttpException({ success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.scheduleService.getSchedule(studentId, filters);
            return { success: true, data, message: 'Lấy lịch học thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, error: error.message, message: 'Không thể lấy lịch học' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionById(req, sessionId) {
        try {
            const studentId = req.user?.studentId;
            if (!studentId) {
                throw new common_1.HttpException({ success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.scheduleService.getSessionById(studentId, sessionId);
            if (!data) {
                throw new common_1.HttpException({ success: false, error: 'Session not found', message: 'Không tìm thấy buổi học' }, common_1.HttpStatus.NOT_FOUND);
            }
            return { success: true, data, message: 'Lấy chi tiết buổi học thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, error: error.message, message: 'Không thể lấy chi tiết buổi học' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getScheduleDetail(req, id) {
        try {
            const studentId = req.user?.studentId;
            if (!studentId) {
                throw new common_1.HttpException({ success: false, error: 'Student ID not found', message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this.scheduleService.getScheduleDetail(studentId, id);
            if (!data) {
                throw new common_1.HttpException({ success: false, error: 'Schedule not found', message: 'Không tìm thấy lịch học' }, common_1.HttpStatus.NOT_FOUND);
            }
            return { success: true, data, message: 'Lấy chi tiết lịch học thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({ success: false, error: error.message, message: 'Không thể lấy chi tiết lịch học' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Get)('weekly'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch học theo tuần (student)' }),
    (0, swagger_1.ApiQuery)({ name: 'weekStart', description: 'Ngày bắt đầu tuần (YYYY-MM-DD)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('weekStart')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getWeeklySchedule", null);
__decorate([
    (0, common_1.Get)('monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch học theo tháng (student)' }),
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
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch học của học sinh theo khoảng ngày' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'YYYY-MM-DD' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, schedule_filters_dto_1.ScheduleFiltersDto]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết một buổi học của học sinh' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'ID buổi học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSessionById", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết lịch học theo id (student)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID lịch/buổi học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getScheduleDetail", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Student Schedule'),
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_service_1.StudentScheduleService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map