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
exports.TriggerManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TriggerManagementService = class TriggerManagementService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    formatJobExecution(job) {
        return {
            id: job.id,
            jobType: job.job_type || job.jobType,
            status: job.status,
            startedAt: job.started_at || job.startedAt,
            completedAt: job.completed_at || job.completedAt,
            totalItems: job.total_items || job.totalItems,
            successCount: job.success_count || job.successCount,
            failedCount: job.failed_count || job.failedCount,
            metadata: job.metadata,
            errorDetails: job.error_details || job.errorDetails,
            errorMessage: job.error_message || job.errorMessage,
            durationMs: job.duration_ms || job.durationMs,
            createdAt: job.created_at || job.createdAt,
            updatedAt: job.updated_at || job.updatedAt,
        };
    }
    async listCronJobs(filters) {
        const now = new Date();
        let defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (defaultStartDate.getMonth() === now.getMonth()) {
            defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 0);
        }
        const defaultEndDate = now;
        const { jobType, status, startDate = defaultStartDate, endDate = defaultEndDate, page = 1, limit = 10 } = filters;
        const where = {
            startedAt: {
                gte: startDate,
                lte: endDate,
            }
        };
        if (jobType && jobType !== 'all') {
            where.jobType = jobType;
        }
        if (status && status !== 'all') {
            where.status = status;
        }
        const [executions, total] = await Promise.all([
            this.prismaService.cronJobExecution.findMany({
                where,
                orderBy: { startedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prismaService.cronJobExecution.count({ where }),
        ]);
        const formattedExecutions = executions.map(job => this.formatJobExecution(job));
        return {
            data: formattedExecutions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: {
                jobType: jobType || 'all',
                status: status || 'all',
                startDate,
                endDate,
            }
        };
    }
    async getJobTypes() {
        const jobTypes = await this.prismaService.cronJobExecution.findMany({
            distinct: ['jobType'],
            select: { jobType: true },
            orderBy: { jobType: 'asc' },
        });
        return {
            data: jobTypes.map(item => item.jobType),
        };
    }
    async getLatestExecutions() {
        const jobTypes = await this.prismaService.cronJobExecution.findMany({
            distinct: ['jobType'],
            select: { jobType: true },
        });
        const latestExecutions = await Promise.all(jobTypes.map(async ({ jobType }) => {
            return await this.prismaService.cronJobExecution.findFirst({
                where: { jobType },
                orderBy: { startedAt: 'desc' },
            });
        }));
        const formattedExecutions = latestExecutions
            .filter(job => job !== null)
            .map(job => this.formatJobExecution(job));
        return { data: formattedExecutions };
    }
    async getCronJobDetails(id) {
        const execution = await this.prismaService.cronJobExecution.findUnique({
            where: { id },
        });
        if (!execution) {
            throw new Error('Cron job execution not found');
        }
        return { data: execution };
    }
    async getCronJobHistory(jobType, filters) {
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const defaultEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        const { status, startDate = defaultStartDate, endDate = defaultEndDate, page = 1, limit = 10 } = filters;
        const where = {
            jobType,
            startedAt: {
                gte: startDate,
                lte: endDate,
            }
        };
        if (status && status !== 'all') {
            where.status = status;
        }
        const [data, total] = await Promise.all([
            this.prismaService.cronJobExecution.findMany({
                where,
                orderBy: { startedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prismaService.cronJobExecution.count({ where }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: {
                status: status || 'all',
                startDate,
                endDate,
            }
        };
    }
    async getCronJobStats(jobType, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const stats = await this.prismaService.cronJobExecution.aggregate({
            where: {
                jobType,
                startedAt: {
                    gte: startDate,
                },
            },
            _count: true,
            _avg: {
                durationMs: true,
                successCount: true,
                failedCount: true,
            },
            _sum: {
                totalItems: true,
                successCount: true,
                failedCount: true,
            },
        });
        const statusBreakdown = await this.prismaService.cronJobExecution.groupBy({
            by: ['status'],
            where: {
                jobType,
                startedAt: {
                    gte: startDate,
                },
            },
            _count: true,
        });
        return {
            data: {
                ...stats,
                statusBreakdown: statusBreakdown.map(item => ({
                    status: item.status,
                    count: item._count,
                })),
                period: `Last ${days} days`,
            },
        };
    }
    async retryCronJob(id) {
        const execution = await this.prismaService.cronJobExecution.findUnique({
            where: { id },
        });
        if (!execution) {
            throw new Error('Cron job execution not found');
        }
        if (execution.status !== 'failed') {
            throw new Error('Only failed jobs can be retried');
        }
        const retryExecution = await this.prismaService.cronJobExecution.create({
            data: {
                jobType: execution.jobType,
                status: 'pending',
                metadata: {
                    ...(execution.metadata || {}),
                    retryOf: execution.id,
                    retryReason: 'Manual retry',
                },
            },
        });
        return {
            data: retryExecution,
            message: 'Job marked for retry',
        };
    }
    async getAllType() {
        const jobTypes = await this.prismaService.cronJobExecution.findMany({
            distinct: ['jobType'],
            select: {
                jobType: true,
            },
            orderBy: { jobType: 'asc' },
        });
        const latestExecutions = await Promise.all(jobTypes.map(async ({ jobType }) => {
            return await this.prismaService.cronJobExecution.findFirst({
                where: { jobType },
                orderBy: { startedAt: 'desc' },
            });
        }));
        const formattedExecutions = latestExecutions
            .filter(job => job !== null)
            .map(job => this.formatJobExecution(job));
        return formattedExecutions;
    }
};
exports.TriggerManagementService = TriggerManagementService;
exports.TriggerManagementService = TriggerManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TriggerManagementService);
//# sourceMappingURL=trigger-management.service.js.map