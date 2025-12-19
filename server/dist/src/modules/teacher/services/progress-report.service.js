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
exports.TeacherProgressReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TeacherProgressReportService = class TeacherProgressReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listReports(teacherId, params = {}) {
        const { status = 'DRAFT', periodLabel } = params;
        const where = {
            teacherId,
            ...(status && status !== 'ALL' ? { status } : {}),
            ...(periodLabel ? { periodLabel } : {}),
        };
        return this.prisma.progressReport.findMany({
            where,
            include: {
                student: { include: { user: true } },
                class: { include: { subject: true } },
            },
            orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async updateDraft(teacherId, reportId, data) {
        const report = await this.prisma.progressReport.findUnique({ where: { id: reportId } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        if (report.teacherId !== teacherId)
            throw new common_1.ForbiddenException('Not allowed');
        if (report.status !== 'DRAFT')
            throw new common_1.ForbiddenException('Only drafts can be updated');
        return this.prisma.progressReport.update({
            where: { id: reportId },
            data: { overallComment: data.overallComment ?? undefined },
        });
    }
    async publish(teacherId, reportId, data) {
        const report = await this.prisma.progressReport.findUnique({ where: { id: reportId } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        if (report.teacherId !== teacherId)
            throw new common_1.ForbiddenException('Not allowed');
        return this.prisma.progressReport.update({
            where: { id: reportId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                overallComment: data.overallComment ?? report.overallComment ?? undefined,
            },
        });
    }
    async bulkPublish(teacherId, reportIds) {
        if (reportIds.length > 200) {
            throw new common_1.ForbiddenException('Không thể duyệt quá 200 báo cáo cùng lúc. Vui lòng lọc và duyệt theo từng lớp.');
        }
        const reports = await this.prisma.progressReport.findMany({
            where: { id: { in: reportIds } },
            select: { id: true, teacherId: true, status: true },
        });
        const unauthorized = reports.filter((r) => r.teacherId !== teacherId);
        if (unauthorized.length > 0) {
            throw new common_1.ForbiddenException('Not authorized for some reports');
        }
        const notFound = reportIds.filter((id) => !reports.find((r) => r.id === id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Reports not found: ${notFound.join(', ')}`);
        }
        const batchSize = 50;
        const publishedAt = new Date();
        let totalPublished = 0;
        for (let i = 0; i < reportIds.length; i += batchSize) {
            const batch = reportIds.slice(i, i + batchSize);
            const result = await this.prisma.progressReport.updateMany({
                where: {
                    id: { in: batch },
                    teacherId,
                },
                data: {
                    status: 'PUBLISHED',
                    publishedAt,
                },
            });
            totalPublished += result.count;
        }
        return {
            published: totalPublished,
            message: `Successfully published ${totalPublished} reports`,
        };
    }
};
exports.TeacherProgressReportService = TeacherProgressReportService;
exports.TeacherProgressReportService = TeacherProgressReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeacherProgressReportService);
//# sourceMappingURL=progress-report.service.js.map