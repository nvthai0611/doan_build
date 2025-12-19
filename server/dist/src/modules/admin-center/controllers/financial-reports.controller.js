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
exports.FinancialReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const financial_reports_service_1 = require("../services/financial-reports.service");
let FinancialReportsController = class FinancialReportsController {
    constructor(financialReportsService) {
        this.financialReportsService = financialReportsService;
    }
    async getSummary(month, year) {
        const data = await this.financialReportsService.getSummary(month, year);
        return { data, message: 'OK' };
    }
    async getOutstandingStudents(month, year) {
        const data = await this.financialReportsService.getOutstandingStudents(month, year);
        return { data, message: 'OK' };
    }
    async getOverdueStudents(month, year) {
        const data = await this.financialReportsService.getOverdueStudents(month, year);
        return { data, message: 'OK' };
    }
    async getPendingStudents(month, year) {
        const data = await this.financialReportsService.getPendingStudents(month, year);
        return { data, message: 'OK' };
    }
    async getClassStudentsStatus(month, year) {
        const data = await this.financialReportsService.getClassStudentsStatus(month, year);
        return { data, message: 'OK' };
    }
};
exports.FinancialReportsController = FinancialReportsController;
__decorate([
    (0, common_1.Get)('summary'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('outstanding-students'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getOutstandingStudents", null);
__decorate([
    (0, common_1.Get)('overdue-students'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getOverdueStudents", null);
__decorate([
    (0, common_1.Get)('pending-students'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getPendingStudents", null);
__decorate([
    (0, common_1.Get)('class-students-status'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getClassStudentsStatus", null);
exports.FinancialReportsController = FinancialReportsController = __decorate([
    (0, common_1.Controller)('financial-reports'),
    __metadata("design:paramtypes", [financial_reports_service_1.FinancialReportsService])
], FinancialReportsController);
//# sourceMappingURL=financial-reports.controller.js.map