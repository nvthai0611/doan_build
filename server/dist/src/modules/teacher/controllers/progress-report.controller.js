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
exports.TeacherProgressReportController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const progress_report_service_1 = require("../services/progress-report.service");
let TeacherProgressReportController = class TeacherProgressReportController {
    constructor(service) {
        this.service = service;
    }
    async list(req, status, periodLabel) {
        const teacherId = req.user?.teacherId;
        const data = await this.service.listReports(teacherId, { status, periodLabel });
        return { data, message: 'OK' };
    }
    async bulkPublish(req, body) {
        const teacherId = req.user?.teacherId;
        const data = await this.service.bulkPublish(teacherId, body.reportIds);
        return { data, message: 'Queued for publishing' };
    }
    async updateDraft(req, id, body) {
        const teacherId = req.user?.teacherId;
        const data = await this.service.updateDraft(teacherId, id, body);
        return { data, message: 'Updated' };
    }
    async publish(req, id, body) {
        const teacherId = req.user?.teacherId;
        const data = await this.service.publish(teacherId, id, body);
        return { data, message: 'Published' };
    }
};
exports.TeacherProgressReportController = TeacherProgressReportController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('periodLabel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeacherProgressReportController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('bulk-publish'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherProgressReportController.prototype, "bulkPublish", null);
__decorate([
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherProgressReportController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherProgressReportController.prototype, "publish", null);
exports.TeacherProgressReportController = TeacherProgressReportController = __decorate([
    (0, common_1.Controller)('progress-reports'),
    __metadata("design:paramtypes", [progress_report_service_1.TeacherProgressReportService])
], TeacherProgressReportController);
//# sourceMappingURL=progress-report.controller.js.map