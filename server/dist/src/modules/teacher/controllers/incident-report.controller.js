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
exports.IncidentReportController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const incident_report_service_1 = require("../services/incident-report.service");
let IncidentReportController = class IncidentReportController {
    constructor(incidentReportService) {
        this.incidentReportService = incidentReportService;
    }
    async create(req, body) {
        const teacherId = req?.user?.teacherId;
        if (!teacherId) {
            throw new common_1.HttpException('Không xác định được giáo viên', common_1.HttpStatus.UNAUTHORIZED);
        }
        return await this.incidentReportService.createIncidentReport(teacherId, body);
    }
    async findMyReports(req, page = '1', limit = '10', status) {
        const teacherId = req?.user?.teacherId;
        if (!teacherId) {
            throw new common_1.HttpException('Không xác định được giáo viên', common_1.HttpStatus.UNAUTHORIZED);
        }
        return await this.incidentReportService.getMyIncidentReports(teacherId, {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            status,
        });
    }
    async getDetail(req, id) {
        const teacherId = req?.user?.teacherId;
        if (!teacherId) {
            throw new common_1.HttpException('Không xác định được giáo viên', common_1.HttpStatus.UNAUTHORIZED);
        }
        return await this.incidentReportService.getIncidentReportDetail(teacherId, id);
    }
};
exports.IncidentReportController = IncidentReportController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo báo cáo sự cố' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IncidentReportController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách báo cáo sự cố của tôi' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], IncidentReportController.prototype, "findMyReports", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết báo cáo sự cố' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IncidentReportController.prototype, "getDetail", null);
exports.IncidentReportController = IncidentReportController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Incident Reports'),
    (0, common_1.Controller)('incident-report'),
    __metadata("design:paramtypes", [incident_report_service_1.IncidentReportService])
], IncidentReportController);
//# sourceMappingURL=incident-report.controller.js.map