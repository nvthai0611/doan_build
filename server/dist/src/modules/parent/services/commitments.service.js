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
exports.CommitmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let CommitmentsService = class CommitmentsService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getStudentCommitments(studentId, parentId) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { parentId: true },
        });
        if (!student) {
            throw new common_1.NotFoundException('Không tìm thấy học sinh');
        }
        if (student.parentId !== parentId) {
            throw new common_1.BadRequestException('Bạn không có quyền xem hợp đồng của học sinh này');
        }
        const commitments = await this.prisma.contractUpload.findMany({
            where: { studentId },
            orderBy: { uploadedAt: 'desc' },
        });
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return commitments.map((commitment) => {
            let status = 'active';
            if (commitment.expiredAt) {
                if (commitment.expiredAt < now) {
                    status = 'expired';
                }
                else if (commitment.expiredAt <= thirtyDaysFromNow) {
                    status = 'expiring_soon';
                }
            }
            return {
                id: commitment.id,
                contractType: commitment.contractType,
                uploadedImageUrl: commitment.uploadedImageUrl,
                uploadedImageName: commitment.uploadedImageName,
                uploadedAt: commitment.uploadedAt,
                expiredAt: commitment.expiredAt,
                status,
                note: commitment.note,
                subjectIds: commitment.subjectIds || [],
            };
        });
    }
    async uploadCommitment(parentId, studentId, file, subjectIds, note) {
        if (!file) {
            throw new common_1.BadRequestException('File không được để trống');
        }
        if (!subjectIds || subjectIds.length === 0) {
            throw new common_1.BadRequestException('Phải chọn ít nhất một môn học');
        }
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { parentId: true },
        });
        if (!student) {
            throw new common_1.NotFoundException('Không tìm thấy học sinh');
        }
        if (student.parentId !== parentId) {
            throw new common_1.BadRequestException('Bạn không có quyền upload hợp đồng cho học sinh này');
        }
        const subjects = await this.prisma.subject.findMany({
            where: { id: { in: subjectIds } },
        });
        if (subjects.length !== subjectIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều môn học không hợp lệ');
        }
        let uploadResult;
        try {
            uploadResult = await this.cloudinaryService.uploadDocument(file, `commitments/${studentId}`);
        }
        catch (err) {
            uploadResult = {
                secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
                public_id: `mock_${Date.now()}`,
            };
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const nextYear = currentYear + 1;
        const expiredAt = new Date(nextYear, 4, 31, 23, 59, 59, 999);
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
                studentId,
                parentId,
                contractType: 'student_commitment',
                subjectIds,
                uploadedImageUrl: uploadResult.secure_url,
                uploadedImageName: file.originalname,
                note: note || null,
                expiredAt,
                status,
            },
        });
        return {
            id: created.id,
            contractType: created.contractType,
            uploadedImageUrl: created.uploadedImageUrl,
            uploadedImageName: created.uploadedImageName,
            uploadedAt: created.uploadedAt,
            expiredAt: created.expiredAt,
            status: created.status || 'active',
            note: created.note,
            subjectIds: created.subjectIds || [],
        };
    }
    async deleteCommitment(commitmentId, studentId, parentId) {
        const commitment = await this.prisma.contractUpload.findUnique({
            where: { id: commitmentId },
            select: { studentId: true },
        });
        if (!commitment) {
            throw new common_1.NotFoundException('Không tìm thấy hợp đồng cam kết');
        }
        if (commitment.studentId !== studentId) {
            throw new common_1.BadRequestException('Hợp đồng không thuộc về học sinh này');
        }
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { parentId: true },
        });
        if (!student || student.parentId !== parentId) {
            throw new common_1.BadRequestException('Bạn không có quyền xóa hợp đồng này');
        }
        const classRequests = await this.prisma.studentClassRequest.findMany({
            where: { contractUploadId: commitmentId },
            select: { id: true },
        });
        if (classRequests.length > 0) {
            throw new common_1.BadRequestException('Không thể xóa hợp đồng này vì đang được sử dụng trong yêu cầu tham gia lớp học');
        }
        await this.prisma.contractUpload.delete({
            where: { id: commitmentId },
        });
        return { message: 'Xóa hợp đồng cam kết thành công' };
    }
};
exports.CommitmentsService = CommitmentsService;
exports.CommitmentsService = CommitmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], CommitmentsService);
//# sourceMappingURL=commitments.service.js.map