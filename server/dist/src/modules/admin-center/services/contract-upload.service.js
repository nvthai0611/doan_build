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
exports.ContractUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let ContractUploadService = class ContractUploadService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getByStudentId(studentId) {
        const contracts = await this.prisma.contractUpload.findMany({
            where: { studentId },
            orderBy: { uploadedAt: 'desc' },
        });
        return contracts;
    }
    async uploadContract(studentId, file, data) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const uploadResult = await this.cloudinaryService.uploadDocument(file, 'student-applications');
        let expiredAt = data.expiredAt;
        if (!expiredAt) {
            const now = new Date();
            const nextYear = now.getFullYear() + 1;
            expiredAt = new Date(nextYear, 4, 31, 23, 59, 59);
        }
        const contract = await this.prisma.contractUpload.create({
            data: {
                studentId,
                parentId: data.parentId && data.parentId.trim() !== '' ? data.parentId.trim() : null,
                contractType: 'student_commitment',
                subjectIds: data.subjectIds || [],
                uploadedImageUrl: uploadResult.secure_url,
                uploadedImageName: file.originalname,
                uploadedAt: new Date(),
                expiredAt: expiredAt,
                note: data.note || `Đơn xin học thêm (${student.user.fullName})`,
                status: 'active'
            }
        });
        return contract;
    }
    async updateContract(contractId, data) {
        const contract = await this.prisma.contractUpload.findUnique({
            where: { id: contractId }
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        return await this.prisma.contractUpload.update({
            where: { id: contractId },
            data: {
                ...(data.subjectIds && { subjectIds: data.subjectIds }),
                ...(data.note && { note: data.note }),
                ...(data.expiredAt && { expiredAt: data.expiredAt }),
                ...(data.status && { status: data.status }),
            }
        });
    }
    async deleteContract(contractId) {
        const contract = await this.prisma.contractUpload.findUnique({
            where: { id: contractId }
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        await this.prisma.contractUpload.delete({
            where: { id: contractId }
        });
        return { success: true };
    }
};
exports.ContractUploadService = ContractUploadService;
exports.ContractUploadService = ContractUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ContractUploadService);
//# sourceMappingURL=contract-upload.service.js.map