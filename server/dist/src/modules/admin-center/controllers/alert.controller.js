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
exports.AlertController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alert_service_1 = require("../services/alert.service");
const alert_dto_1 = require("../dto/alert.dto");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
let AlertController = class AlertController {
    constructor(alertService) {
        this.alertService = alertService;
    }
    async getAlerts(query) {
        return this.alertService.getAlerts(query);
    }
    async getUnreadCount() {
        return this.alertService.getUnreadCount();
    }
    async createAlert(createAlertDto) {
        return this.alertService.createAlert(createAlertDto);
    }
    async markAllAsRead() {
        return this.alertService.markAllAsRead();
    }
    async updateAlert(id, updateAlertDto) {
        return this.alertService.updateAlert(id, updateAlertDto);
    }
    async deleteAlert(id) {
        return this.alertService.deleteAlert(id);
    }
};
exports.AlertController = AlertController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách cảnh báo' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [alert_dto_1.GetAlertsDto]),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy số lượng cảnh báo chưa đọc' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo cảnh báo mới' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [alert_dto_1.CreateAlertDto]),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Đánh dấu tất cả đã đọc' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('center_owner'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật cảnh báo' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, alert_dto_1.UpdateAlertDto]),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "updateAlert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa cảnh báo' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "deleteAlert", null);
exports.AlertController = AlertController = __decorate([
    (0, swagger_1.ApiTags)('Alerts'),
    (0, common_1.Controller)('alerts'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [alert_service_1.AlertService])
], AlertController);
//# sourceMappingURL=alert.controller.js.map