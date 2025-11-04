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
var ContractsManageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsManageService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let ContractsManageService = ContractsManageService_1 = class ContractsManageService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.logger = new common_1.Logger(ContractsManageService_1.name);
    }
    async listByTeacher(teacherId) {
        const uploads = await this.prisma.contractUpload.findMany({
            where: { teacherId },
            orderBy: { uploadedAt: 'desc' },
        });
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return uploads.map((u) => {
            let status = 'active';
            if (u.expiredAt) {
                if (u.expiredAt < now) {
                    status = 'expired';
                }
                else if (u.expiredAt <= thirtyDaysFromNow) {
                    status = 'expiring_soon';
                }
            }
            return {
                id: u.id,
                contractType: u.contractType,
                uploadedImageUrl: u.uploadedImageUrl,
                uploadedImageName: u.uploadedImageName,
                uploadedAt: u.uploadedAt,
                expiryDate: u.expiredAt,
                notes: u.note,
                status,
            };
        });
    }
    async createForTeacher(teacherId, file, contractType, expiryDate, notes) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!expiryDate) {
            throw new common_1.BadRequestException('Expiry date is required');
        }
        let uploadResult;
        try {
            uploadResult = await this.cloudinaryService.uploadDocument(file, `contracts/${teacherId}`);
        }
        catch (err) {
            uploadResult = {
                secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
                public_id: `mock_${Date.now()}`,
            };
        }
        const expiredAt = new Date(expiryDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        let status = 'active';
        if (expiredAt < now) {
            status = 'expired';
        }
        else if (expiredAt <= thirtyDaysFromNow) {
            status = 'expiring_soon';
        }
        const created = await this.prisma.contractUpload.create({
            data: {
                teacherId,
                contractType: contractType || 'other',
                uploadedImageUrl: uploadResult.secure_url,
                uploadedImageName: file.originalname,
                expiredAt,
                note: notes || null,
                status,
            },
        });
        return {
            id: created.id,
            contractType: created.contractType,
            uploadedImageUrl: created.uploadedImageUrl,
            uploadedImageName: created.uploadedImageName,
            uploadedAt: created.uploadedAt,
            expiryDate: created.expiredAt,
            notes: created.note,
            status: created.status,
        };
    }
    async deleteForTeacher(teacherId, id) {
        const found = await this.prisma.contractUpload.findUnique({ where: { id } });
        if (!found) {
            throw new common_1.NotFoundException('Contract upload not found');
        }
        if (found.teacherId !== teacherId) {
            throw new common_1.BadRequestException('You do not have permission to delete this upload');
        }
        await this.prisma.contractUpload.delete({ where: { id } });
        return { message: 'Deleted' };
    }
    async refreshContractStatusesDaily() {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        this.logger.log('Running daily contract status refresh job...');
        const expiredRes = await this.prisma.contractUpload.updateMany({
            where: { expiredAt: { lt: now }, status: { not: 'expired' } },
            data: { status: 'expired' },
        });
        const expiringSoonRes = await this.prisma.contractUpload.updateMany({
            where: {
                expiredAt: { gte: now, lte: thirtyDaysFromNow },
                status: { not: 'expiring_soon' },
            },
            data: { status: 'expiring_soon' },
        });
        const activeRes = await this.prisma.contractUpload.updateMany({
            where: {
                OR: [
                    { expiredAt: { gt: thirtyDaysFromNow } },
                    { expiredAt: null },
                ],
                status: { not: 'active' },
            },
            data: { status: 'active' },
        });
        this.logger.log(`Contract status refresh complete. expired=${expiredRes.count}, expiringSoon=${expiringSoonRes.count}, active=${activeRes.count}`);
    }
};
exports.ContractsManageService = ContractsManageService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractsManageService.prototype, "refreshContractStatusesDaily", null);
exports.ContractsManageService = ContractsManageService = ContractsManageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ContractsManageService);
//# sourceMappingURL=contracts-manage.service.js.map