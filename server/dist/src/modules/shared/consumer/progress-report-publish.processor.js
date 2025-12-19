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
exports.ProgressReportPublishProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../../db/prisma.service");
let ProgressReportPublishProcessor = class ProgressReportPublishProcessor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handlePublishReport(job) {
        const { reportId, teacherId } = job.data;
        console.log(`[Job ${job.id}] Publishing progress report ${reportId}`);
        try {
            const report = await this.prisma.progressReport.findUnique({
                where: { id: reportId },
            });
            if (!report) {
                console.error(`Report ${reportId} not found`);
                return { success: false, error: 'Report not found' };
            }
            if (report.teacherId !== teacherId) {
                console.error(`Teacher ${teacherId} not authorized for report ${reportId}`);
                return { success: false, error: 'Not authorized' };
            }
            await this.prisma.progressReport.update({
                where: { id: reportId },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                },
            });
            console.log(`[Job ${job.id}] Successfully published report ${reportId}`);
            return { success: true, reportId };
        }
        catch (error) {
            console.error(`[Job ${job.id}] Error publishing report ${reportId}:`, error);
            throw error;
        }
    }
};
exports.ProgressReportPublishProcessor = ProgressReportPublishProcessor;
__decorate([
    (0, bull_1.Process)('publish_single_report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressReportPublishProcessor.prototype, "handlePublishReport", null);
exports.ProgressReportPublishProcessor = ProgressReportPublishProcessor = __decorate([
    (0, bull_1.Processor)('progress_report_publish'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressReportPublishProcessor);
//# sourceMappingURL=progress-report-publish.processor.js.map