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
exports.FinancialController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_service_1 = require("../services/financial.service");
let FinancialController = class FinancialController {
    constructor(financialService) {
        this.financialService = financialService;
    }
    async getAllFeeRecordsForParent(req, status) {
        const parentId = req.user.parentId;
        console.log(status);
        return this.financialService.getAllFeeRecordsForParent(parentId, status);
    }
    async getFeeRecordDetail(req, id) {
        const parentId = req.user.parentId;
        return this.financialService.getPaymentDetails(id, parentId);
    }
    async getPaymentByStatus(req, status) {
        const parentId = req.user.parentId;
        return await this.financialService.getPaymentForParentByStatus(parentId, status);
    }
    async createPaymentForFeeRecords(req, feeRecordIds) {
        const parentId = req.user.parentId;
        return await this.financialService.createPaymentForFeeRecords(parentId, feeRecordIds);
    }
    async updatePaymentFeeRecords(req, paymentId, feeRecordIds) {
        const parentId = req.user.parentId;
        return await this.financialService.updatePaymentFeeRecords(paymentId, feeRecordIds, parentId);
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('fee-records'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getAllFeeRecordsForParent", null);
__decorate([
    (0, common_1.Get)(':id/detail'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getFeeRecordDetail", null);
__decorate([
    (0, common_1.Get)('payment-history'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getPaymentByStatus", null);
__decorate([
    (0, common_1.Post)('create-payment'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('feeRecordIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createPaymentForFeeRecords", null);
__decorate([
    (0, common_1.Patch)('update-payment-fee-records'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('paymentId')),
    __param(2, (0, common_1.Body)('feeRecordIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updatePaymentFeeRecords", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Financial'),
    (0, common_1.Controller)('financial'),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map