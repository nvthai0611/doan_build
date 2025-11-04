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
exports.IncidentHandleController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const incident_handle_service_1 = require("../services/incident-handle.service");
let IncidentHandleController = class IncidentHandleController {
    constructor(incidentHandleService) {
        this.incidentHandleService = incidentHandleService;
    }
    async list(page = '1', limit = '20', status, severity) {
        return await this.incidentHandleService.listIncidents({
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            status,
            severity,
        });
    }
    async updateStatus(id, body) {
        if (!body?.status) {
            throw new common_1.HttpException('Thiếu trạng thái', common_1.HttpStatus.BAD_REQUEST);
        }
        return await this.incidentHandleService.updateStatus(id, body.status);
    }
};
exports.IncidentHandleController = IncidentHandleController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách báo cáo sự cố' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'severity', required: false, type: String }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], IncidentHandleController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái xử lý sự cố' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IncidentHandleController.prototype, "updateStatus", null);
exports.IncidentHandleController = IncidentHandleController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Incident Handle'),
    (0, common_1.Controller)('incident-handle'),
    __metadata("design:paramtypes", [incident_handle_service_1.IncidentHandleService])
], IncidentHandleController);
//# sourceMappingURL=incident-handle.controller.js.map