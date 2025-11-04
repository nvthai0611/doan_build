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
exports.HolidaysSettingController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const holidays_setting_service_1 = require("../services/holidays-setting.service");
const create_holiday_dto_1 = require("../dto/holiday/create-holiday.dto");
const update_holiday_dto_1 = require("../dto/holiday/update-holiday.dto");
let HolidaysSettingController = class HolidaysSettingController {
    constructor(holidaysService) {
        this.holidaysService = holidaysService;
    }
    async listHolidays(year) {
        return this.holidaysService.list(year);
    }
    async createHoliday(dto) {
        return this.holidaysService.create(dto);
    }
    async updateHoliday(id, dto) {
        return this.holidaysService.update(id, dto);
    }
    async deleteHoliday(id) {
        return this.holidaysService.remove(id);
    }
    async applyHoliday(id) {
        return this.holidaysService.apply(id);
    }
};
exports.HolidaysSettingController = HolidaysSettingController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HolidaysSettingController.prototype, "listHolidays", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_holiday_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", Promise)
], HolidaysSettingController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_holiday_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", Promise)
], HolidaysSettingController.prototype, "updateHoliday", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HolidaysSettingController.prototype, "deleteHoliday", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HolidaysSettingController.prototype, "applyHoliday", null);
exports.HolidaysSettingController = HolidaysSettingController = __decorate([
    (0, common_1.Controller)('holidays-setting'),
    __metadata("design:paramtypes", [holidays_setting_service_1.HolidaysSettingService])
], HolidaysSettingController);
//# sourceMappingURL=holidays-setting.controller.js.map