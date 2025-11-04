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
exports.SettingsManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const settings_management_service_1 = require("../services/settings-management.service");
const update_setting_dto_1 = require("../dto/setting/update-setting.dto");
let SettingsManagementController = class SettingsManagementController {
    constructor(service) {
        this.service = service;
    }
    async getAll(group) {
        return this.service.getAll(group);
    }
    async getByKey(key) {
        return this.service.getByKey(key);
    }
    async upsert(dto) {
        return this.service.upsert(dto);
    }
};
exports.SettingsManagementController = SettingsManagementController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsManagementController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsManagementController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Put)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_setting_dto_1.UpdateSettingDto]),
    __metadata("design:returntype", Promise)
], SettingsManagementController.prototype, "upsert", null);
exports.SettingsManagementController = SettingsManagementController = __decorate([
    (0, common_1.Controller)('settings-management'),
    __metadata("design:paramtypes", [settings_management_service_1.SettingsManagementService])
], SettingsManagementController);
//# sourceMappingURL=settings-management.controller.js.map