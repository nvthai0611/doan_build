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
exports.PublicShowcasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PublicShowcasesService = class PublicShowcasesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getShowcases(query) {
        const where = {};
        if (query?.featured !== undefined) {
            where.featured = query.featured;
        }
        const showcases = await this.prisma.showcase.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { order: 'asc' },
                { publishedAt: 'desc' },
            ],
            select: {
                id: true,
                title: true,
                description: true,
                studentImage: true,
                achievement: true,
                featured: true,
                order: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return {
            success: true,
            data: showcases,
            message: 'Lấy danh sách học sinh tiêu biểu thành công',
        };
    }
};
exports.PublicShowcasesService = PublicShowcasesService;
exports.PublicShowcasesService = PublicShowcasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicShowcasesService);
//# sourceMappingURL=public-showcases.service.js.map