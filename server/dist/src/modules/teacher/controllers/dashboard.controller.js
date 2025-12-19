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
exports.TeacherDashboardController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("../services/dashboard.service");
let TeacherDashboardController = class TeacherDashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getStats(req) {
        const teacherId = req.user?.teacherId;
        if (!teacherId) {
            throw new Error('Teacher ID not found');
        }
        const stats = await this.dashboardService.getStats(teacherId);
        return { data: stats };
    }
    async getTodaySessions(req) {
        const teacherId = req.user?.teacherId;
        if (!teacherId) {
            throw new Error('Teacher ID not found');
        }
        const sessions = await this.dashboardService.getTodaySessions(teacherId);
        return { data: sessions };
    }
};
exports.TeacherDashboardController = TeacherDashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherDashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('today-sessions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherDashboardController.prototype, "getTodaySessions", null);
exports.TeacherDashboardController = TeacherDashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.TeacherDashboardService])
], TeacherDashboardController);
//# sourceMappingURL=dashboard.controller.js.map