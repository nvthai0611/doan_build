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
exports.SepayController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const sepay_service_1 = require("../service/sepay.service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
let SepayController = class SepayController {
    constructor(sepayService) {
        this.sepayService = sepayService;
    }
    async createPaymentQR(req, dto) {
        const userId = req.user.userId;
        return this.sepayService.createPaymentQR(userId, { feeRecordIds: dto.feeRecordIds });
    }
    async regeneratePaymentQR(body) {
        return this.sepayService.regeneratePaymentQR(body.paymentId);
    }
    async handleSepayWebhook(webhookData) {
        return this.sepayService.handleWebhook(webhookData);
    }
    async getSepayTransactions(limit) {
        return this.sepayService.getTransactions(limit);
    }
    async verifySepayTransaction(orderCode) {
        return this.sepayService.verifyTransaction(orderCode);
    }
    async sendTestEmail() {
        return this.sepayService.sendTestEmail();
    }
};
exports.SepayController = SepayController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('sepay/create-qr'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "createPaymentQR", null);
__decorate([
    (0, common_1.Post)('sepay/regenerate-qr'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "regeneratePaymentQR", null);
__decorate([
    (0, common_1.Post)('sepay/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "handleSepayWebhook", null);
__decorate([
    (0, common_1.Get)('sepay/transactions'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "getSepayTransactions", null);
__decorate([
    (0, common_1.Get)('sepay/verify/:orderCode'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orderCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "verifySepayTransaction", null);
__decorate([
    (0, common_1.Post)('sepay/test-email'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SepayController.prototype, "sendTestEmail", null);
exports.SepayController = SepayController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [sepay_service_1.SepayService])
], SepayController);
//# sourceMappingURL=sepay.controller.js.map