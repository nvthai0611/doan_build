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
exports.CronTestController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const progress_report_cron_service_1 = require("../service/progress-report-cron.service");
let CronTestController = class CronTestController {
    constructor(progressReportCron) {
        this.progressReportCron = progressReportCron;
    }
    async triggerProgressReports(body) {
        const customStart = body?.startDate ? new Date(body.startDate) : undefined;
        const customEnd = body?.endDate ? new Date(body.endDate) : undefined;
        const result = await this.progressReportCron.generateReportsForPeriod(customStart, customEnd);
        return result;
    }
};
exports.CronTestController = CronTestController;
__decorate([
    (0, common_1.Post)('generate-progress-reports'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CronTestController.prototype, "triggerProgressReports", null);
exports.CronTestController = CronTestController = __decorate([
    (0, common_1.Controller)('cron-test'),
    __metadata("design:paramtypes", [progress_report_cron_service_1.ProgressReportCronService])
], CronTestController);
//# sourceMappingURL=cron-test.controller.js.map