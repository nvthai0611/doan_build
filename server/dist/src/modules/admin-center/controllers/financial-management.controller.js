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
exports.FinancialManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_management_service_1 = require("../services/financial-management.service");
let FinancialManagementController = class FinancialManagementController {
    constructor(financialManagementService) {
        this.financialManagementService = financialManagementService;
    }
    async getSessionFeeStructures() {
        try {
            return await this.financialManagementService.getSessionFeeStructures();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách học phí theo buổi', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionFeeMatrix() {
        try {
            return await this.financialManagementService.getSessionFeeMatrix();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy ma trận học phí theo buổi', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGrades() {
        try {
            return await this.financialManagementService.getGrades();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách khối lớp', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSubjects() {
        try {
            return await this.financialManagementService.getSubjects();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách môn học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async upsertSessionFee(body) {
        try {
            return await this.financialManagementService.upsertSessionFee(body.gradeId, body.subjectId, body.amount);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lưu học phí theo buổi', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkUpdateSessionFees(body) {
        try {
            return await this.financialManagementService.bulkUpdateSessionFees(body.updates);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi cập nhật hàng loạt học phí', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteSessionFee(id) {
        try {
            return await this.financialManagementService.deleteSessionFee(id);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi xóa học phí theo buổi', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FinancialManagementController = FinancialManagementController;
__decorate([
    (0, common_1.Get)('session-fees'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách học phí theo buổi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách học phí theo buổi' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "getSessionFeeStructures", null);
__decorate([
    (0, common_1.Get)('session-fees/matrix'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy ma trận học phí theo buổi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ma trận học phí theo buổi' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "getSessionFeeMatrix", null);
__decorate([
    (0, common_1.Get)('grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách khối lớp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách khối lớp' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "getGrades", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách môn học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách môn học' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Post)('session-fees'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo hoặc cập nhật học phí theo buổi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tạo hoặc cập nhật học phí thành công' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "upsertSessionFee", null);
__decorate([
    (0, common_1.Put)('session-fees/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật hàng loạt học phí theo buổi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật hàng loạt học phí thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "bulkUpdateSessionFees", null);
__decorate([
    (0, common_1.Delete)('session-fees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa học phí theo buổi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa học phí thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialManagementController.prototype, "deleteSessionFee", null);
exports.FinancialManagementController = FinancialManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Financial Management'),
    (0, common_1.Controller)('financial-management'),
    __metadata("design:paramtypes", [financial_management_service_1.FinancialManagementService])
], FinancialManagementController);
//# sourceMappingURL=financial-management.controller.js.map