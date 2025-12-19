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
exports.FileManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let FileManagementService = class FileManagementService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async uploadMaterial(teacherId, dto, file) {
        if (!file) {
            throw new common_1.BadRequestException('File không được để trống');
        }
        const classExists = await this.prisma.class.findUnique({
            where: { id: dto.classId },
        });
        if (!classExists) {
            throw new common_1.NotFoundException('Không tìm thấy lớp học');
        }
        const classWithTeacher = await this.prisma.class.findFirst({
            where: {
                id: dto.classId,
                teacherId: teacherId,
            },
        });
        if (!classWithTeacher) {
            throw new common_1.BadRequestException('Bạn không có quyền upload tài liệu cho lớp này');
        }
        let uploadResult;
        try {
            uploadResult = await this.cloudinaryService.uploadDocument(file, `materials/${dto.classId}`);
        }
        catch (error) {
            uploadResult = {
                secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
                public_id: `mock_${Date.now()}`,
            };
        }
        const material = await this.prisma.material.create({
            data: {
                classId: dto.classId,
                title: dto.title,
                fileName: file.originalname,
                category: dto.category,
                description: dto.description,
                fileUrl: uploadResult.secure_url,
                fileSize: BigInt(file.size),
                fileType: file.mimetype,
                uploadedBy: teacherId,
            },
            include: {
                class: {
                    select: {
                        name: true,
                    },
                },
                uploadedByTeacher: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            id: material.id,
            classId: material.classId,
            className: material.class.name,
            title: material.title,
            fileName: material.fileName,
            category: material.category,
            description: material.description,
            fileUrl: material.fileUrl,
            fileSize: Number(material.fileSize),
            fileType: material.fileType,
            uploadedBy: material.uploadedByTeacher.user.fullName,
            uploadedAt: material.uploadedAt,
            downloads: material.downloads,
        };
    }
    async getMaterials(teacherId, dto) {
        const { classId, category, page = 1, limit = 10, search } = dto;
        const where = {
            uploadedBy: teacherId,
        };
        if (classId) {
            where.classId = classId;
        }
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { fileName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const total = await this.prisma.material.count({ where });
        const stats = await this.prisma.material.aggregate({
            where,
            _sum: {
                fileSize: true,
                downloads: true,
            },
        });
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentUploads = await this.prisma.material.count({
            where: {
                ...where,
                uploadedAt: {
                    gte: weekAgo,
                },
            },
        });
        const materials = await this.prisma.material.findMany({
            where,
            include: {
                class: {
                    select: {
                        name: true,
                    },
                },
                uploadedByTeacher: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                uploadedAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        const formattedMaterials = materials.map((material) => ({
            id: material.id,
            classId: material.classId,
            className: material.class.name,
            title: material.title,
            fileName: material.fileName,
            category: material.category,
            description: material.description,
            fileUrl: material.fileUrl,
            fileSize: material.fileSize ? Number(material.fileSize) : 0,
            fileType: material.fileType,
            uploadedBy: material.uploadedByTeacher.user.fullName,
            uploadedAt: material.uploadedAt,
            downloads: material.downloads,
        }));
        return {
            data: formattedMaterials,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalSize: stats._sum.fileSize ? Number(stats._sum.fileSize) : 0,
                totalDownloads: stats._sum.downloads || 0,
                recentUploads,
            },
        };
    }
    async getTeacherClasses(teacherId) {
        const classes = await this.prisma.class.findMany({
            where: {
                teacherId: teacherId,
            },
            include: {
                grade: {
                    select: {
                        name: true,
                        level: true,
                    },
                },
                subject: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return classes.map((classItem) => ({
            id: classItem.id,
            name: classItem.name,
            grade: classItem.grade?.name || 'N/A',
            gradeLevel: classItem.grade?.level || null,
            subject: classItem.subject.name,
        }));
    }
    async deleteMaterial(teacherId, materialId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material) {
            throw new common_1.NotFoundException('Không tìm thấy tài liệu');
        }
        if (material.uploadedBy !== teacherId) {
            throw new common_1.BadRequestException('Bạn không có quyền xóa tài liệu này');
        }
        await this.prisma.material.delete({
            where: { id: materialId },
        });
        return {
            message: 'Xóa tài liệu thành công',
        };
    }
    async incrementDownload(materialId) {
        await this.prisma.material.update({
            where: { id: materialId },
            data: {
                downloads: {
                    increment: 1,
                },
            },
        });
        return {
            message: 'Tăng lượt tải xuống thành công',
        };
    }
    async getDownloadUrl(materialId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material) {
            throw new common_1.NotFoundException('Không tìm thấy tài liệu');
        }
        const downloadUrl = this.cloudinaryService.getDownloadUrl(material.fileUrl, material.fileName);
        return {
            url: downloadUrl,
            fileName: material.fileName,
            fileType: material.fileType,
            fileSize: material.fileSize ? Number(material.fileSize) : 0,
        };
    }
};
exports.FileManagementService = FileManagementService;
exports.FileManagementService = FileManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], FileManagementService);
//# sourceMappingURL=file-management.service.js.map