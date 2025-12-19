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
exports.ScheduleConflictController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const schedule_conflict_service_1 = require("../services/schedule-conflict.service");
let ScheduleConflictController = class ScheduleConflictController {
    constructor(scheduleConflictService) {
        this.scheduleConflictService = scheduleConflictService;
    }
    async getRoomConflicts(query) {
        return this.scheduleConflictService.getRoomConflicts(query);
    }
    async getTeacherAvailableSlots(teacherId, query) {
        return this.scheduleConflictService.getTeacherAvailableSlots(teacherId, query);
    }
    async addSession(body) {
        return this.scheduleConflictService.addSession(body);
    }
};
exports.ScheduleConflictController = ScheduleConflictController;
__decorate([
    (0, common_1.Get)('room-conflicts'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleConflictController.prototype, "getRoomConflicts", null);
__decorate([
    (0, common_1.Get)('teacher-available-slots/:teacherId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleConflictController.prototype, "getTeacherAvailableSlots", null);
__decorate([
    (0, common_1.Post)('add-session'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleConflictController.prototype, "addSession", null);
exports.ScheduleConflictController = ScheduleConflictController = __decorate([
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_conflict_service_1.ScheduleConflictService])
], ScheduleConflictController);
//# sourceMappingURL=schedule-conflict.controller.js.map