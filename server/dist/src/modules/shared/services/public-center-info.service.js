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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCenterInfoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PublicCenterInfoService = class PublicCenterInfoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCenterInfo() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'center-info' },
        });
        if (!setting) {
            return {
                data: null,
                message: 'Chưa có thông tin trung tâm',
            };
        }
        return {
            data: setting,
            message: 'Lấy thông tin trung tâm thành công',
        };
    }
};
exports.PublicCenterInfoService = PublicCenterInfoService;
exports.PublicCenterInfoService = PublicCenterInfoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicCenterInfoService);
//# sourceMappingURL=public-center-info.service.js.map