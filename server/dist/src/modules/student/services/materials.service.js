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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let MaterialsService = class MaterialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMaterialsForStudent(studentId, dto) {
        const { classId, category, page = 1, limit = 10, search } = dto || {};
        if (classId) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId,
                    classId,
                    status: { in: ['active', 'studying'] },
                    class: {
                        status: 'active'
                    }
                },
            });
            if (!enrollment) {
                return {
                    items: [],
                    meta: { total: 0, page: 1, limit, totalPages: 0 },
                    stats: { totalSize: 0, totalDownloads: 0, recentUploads: 0 },
                };
            }
            const where = { classId };
            if (category)
                where.category = category;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { fileName: { contains: search, mode: 'insensitive' } },
                ];
            }
            const total = await this.prisma.material.count({ where });
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const statsAgg = await this.prisma.material.aggregate({
                where,
                _sum: { fileSize: true },
            });
            const recentUploads = await this.prisma.material.count({
                where: { ...where, uploadedAt: { gte: weekAgo } },
            });
            const materials = await this.prisma.material.findMany({
                where,
                include: {
                    class: { select: { name: true } },
                    uploadedByTeacher: {
                        select: { user: { select: { fullName: true } } },
                    },
                },
                orderBy: { uploadedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });
            const items = materials.map((m) => ({
                id: m.id,
                title: m.title,
                description: m.description,
                fileName: m.fileName,
                fileType: m.fileType,
                fileSize: m.fileSize,
                category: m.category,
                fileUrl: m.fileUrl,
                uploadedAt: m.uploadedAt,
                classId: m.classId,
                className: m.class?.name,
                teacherName: m.uploadedByTeacher?.user?.fullName,
                downloads: m.downloads,
            }));
            return {
                items,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / (limit || 1)),
                },
                stats: {
                    totalSize: Number(statsAgg._sum.fileSize || 0),
                    recentUploads,
                },
            };
        }
        const where = {
            class: {
                status: 'active',
                enrollments: {
                    some: {
                        studentId,
                        status: { in: ['active', 'studying'] },
                    },
                },
            },
        };
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { fileName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const total = await this.prisma.material.count({ where });
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const statsAgg = await this.prisma.material.aggregate({ where, _sum: { fileSize: true } });
        const recentUploads = await this.prisma.material.count({ where: { ...where, uploadedAt: { gte: weekAgo } } });
        const materials = await this.prisma.material.findMany({
            where,
            include: {
                class: { select: { name: true } },
                uploadedByTeacher: { select: { user: { select: { fullName: true } } } },
            },
            orderBy: { uploadedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const items = materials.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            fileName: m.fileName,
            fileType: m.fileType,
            fileSize: m.fileSize,
            category: m.category,
            fileUrl: m.fileUrl,
            uploadedAt: m.uploadedAt,
            classId: m.classId,
            className: m.class?.name,
            teacherName: m.uploadedByTeacher?.user?.fullName,
            downloads: m.downloads,
        }));
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / (limit || 1)),
            },
            stats: {
                totalSize: Number(statsAgg._sum.fileSize || 0),
                totalDownloads: 0,
                recentUploads,
            },
        };
    }
    async incrementDownload(materialId) {
        await this.prisma.material.update({
            where: { id: Number(materialId) },
            data: { downloads: { increment: 1 } },
        });
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map