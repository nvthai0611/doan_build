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
exports.ScheduleManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedule_management_service_1 = require("../services/schedule-management.service");
const query_schedule_dto_1 = require("../dto/schedule/query-schedule.dto");
let ScheduleManagementController = class ScheduleManagementController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async getByDay(query) {
        const data = await this.scheduleService.getScheduleByDay(query);
        return { data, message: 'Lấy lịch theo ngày thành công' };
    }
    async getByWeek(query) {
        const data = await this.scheduleService.getScheduleByWeek(query);
        return { data, message: 'Lấy lịch theo tuần thành công' };
    }
    async getByMonth(query) {
        const monthNum = Number(query.month);
        const yearNum = Number(query.year);
        if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
            throw new Error('month must be an integer between 1 and 12');
        }
        if (!Number.isInteger(yearNum) || yearNum < 1970 || yearNum > 3000) {
            throw new Error('year must be an integer between 1970 and 3000');
        }
        const data = await this.scheduleService.getScheduleByMonth({
            month: monthNum,
            year: yearNum,
        });
        return { data, message: 'Lấy lịch theo tháng thành công' };
    }
    async getSessionById(sessionId) {
        const data = await this.scheduleService.getSessionById(sessionId);
        return { data, message: 'Lấy chi tiết buổi học thành công' };
    }
    async getSessionAttendance(sessionId) {
        const data = await this.scheduleService.getSessionAttendance(sessionId);
        return { data, message: 'Lấy danh sách điểm danh thành công' };
    }
    async getAllActiveClassesWithSchedules(query) {
        const expectedStartDate = query?.expectedStartDate;
        const data = await this.scheduleService.getAllActiveClassesWithSchedules(expectedStartDate);
        return {
            data,
            message: 'Lấy danh sách lớp đang hoạt động kèm lịch học thành công',
        };
    }
    async updateSession(sessionId, body) {
        const data = await this.scheduleService.updateSession(sessionId, body);
        return { data, message: 'Cập nhật buổi học thành công' };
    }
    async checkScheduleConflict(sessionId, sessionDate, startTime, endTime) {
        const data = await this.scheduleService.checkScheduleConflict(sessionId, sessionDate, startTime, endTime);
        return { data, message: 'Kiểm tra xung đột lịch học thành công' };
    }
    async getTeachersInSessionsToday(query) {
        const result = await this.scheduleService.getTeachersInSessionsToday(query);
        return {
            success: true,
            ...result,
            message: 'Lấy danh sách giáo viên tham gia buổi học thành công',
        };
    }
};
exports.ScheduleManagementController = ScheduleManagementController;
__decorate([
    (0, common_1.Get)('sessions/day'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch theo ngày' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_schedule_dto_1.QueryScheduleDto]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getByDay", null);
__decorate([
    (0, common_1.Get)('sessions/week'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch theo tuần' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_schedule_dto_1.QueryScheduleWeekDto]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getByWeek", null);
__decorate([
    (0, common_1.Get)('sessions/month'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch theo tháng' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_schedule_dto_1.QueryScheduleMonthDto]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getByMonth", null);
__decorate([
    (0, common_1.Get)('sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết buổi học theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học', type: 'string' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getSessionById", null);
__decorate([
    (0, common_1.Get)('sessions/:id/attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách điểm danh của buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học', type: 'string' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getSessionAttendance", null);
__decorate([
    (0, common_1.Get)('classes/active-schedules'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy tất cả lớp đang hoạt động/đang tuyển sinh/tạm dừng kèm lịch học của chúng',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getAllActiveClassesWithSchedules", null);
__decorate([
    (0, common_1.Patch)('sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật buổi học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học', type: 'string' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "updateSession", null);
__decorate([
    (0, common_1.Get)('sessions/:id/check-conflict'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra xung đột lịch học tại phòng học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của buổi học', type: 'string' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('sessionDate')),
    __param(2, (0, common_1.Query)('startTime')),
    __param(3, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "checkScheduleConflict", null);
__decorate([
    (0, common_1.Get)('teachers-in-sessions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách giáo viên tham gia buổi học theo ngày (cho trang Buổi học hôm nay)',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleManagementController.prototype, "getTeachersInSessionsToday", null);
exports.ScheduleManagementController = ScheduleManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Schedule Management'),
    (0, common_1.Controller)('schedule-management'),
    __metadata("design:paramtypes", [schedule_management_service_1.ScheduleManagementService])
], ScheduleManagementController);
//# sourceMappingURL=schedule-management.controller.js.map