"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const sepay_controller_1 = require("./controller/sepay.controller");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const sepay_service_1 = require("./service/sepay.service");
const prisma_service_1 = require("../../db/prisma.service");
const payment_gateway_1 = require("./gateway/payment.gateway");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [
            sepay_controller_1.SepayController,
        ],
        providers: [
            sepay_service_1.SepayService,
            payment_gateway_1.PaymentGateway,
            prisma_service_1.PrismaService,
        ],
        exports: [
            sepay_service_1.SepayService,
            payment_gateway_1.PaymentGateway,
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map