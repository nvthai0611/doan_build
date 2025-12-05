import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";

@Injectable()
export class TriggerManagementService {
    constructor(private prismaService: PrismaService) {}

    /**
     * Convert snake_case database fields to camelCase for frontend
     */
    private formatJobExecution(job: any) {
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

    /**
     * List all cron job executions with filters
     * Lấy tất cả records, không filter theo latest nữa
     */
    async listCronJobs(filters: {
        jobType?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        // Set default values - Last month
        const now = new Date();

// Ngày bắt đầu: ngày này của tháng trước (nếu không có thì lấy cuối tháng trước)
let defaultStartDate = new Date(
  now.getFullYear(),
  now.getMonth() - 1,
  now.getDate()
);

// Nếu bị nhảy sang tháng hiện tại → chỉnh về ngày cuối tháng trước
if (defaultStartDate.getMonth() === now.getMonth()) {
  defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 0);
}

// Ngày kết thúc: hôm nay
const defaultEndDate = now;
        
        const { 
            jobType, 
            status, 
            startDate = defaultStartDate,
            endDate = defaultEndDate,
            page = 1, 
            limit = 10 
        } = filters;

        // Build where clause for Prisma
        const where: any = {
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

        // Fetch data and count in parallel
        const [executions, total] = await Promise.all([
            this.prismaService.cronJobExecution.findMany({
                where,
                orderBy: { startedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prismaService.cronJobExecution.count({ where }),
        ]);

        // Format to camelCase
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

    /**
     * Get all available job types
     */
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

    /**
     * Get latest execution for each job type
     */
    async getLatestExecutions() {
        const jobTypes = await this.prismaService.cronJobExecution.findMany({
            distinct: ['jobType'],
            select: { jobType: true },
        });

        const latestExecutions = await Promise.all(
            jobTypes.map(async ({ jobType }) => {
                return await this.prismaService.cronJobExecution.findFirst({
                    where: { jobType },
                    orderBy: { startedAt: 'desc' },
                });
            })
        );

        const formattedExecutions = latestExecutions
            .filter(job => job !== null)
            .map(job => this.formatJobExecution(job));

        return { data: formattedExecutions };
    }

    /**
     * Get execution details by ID
     */
    async getCronJobDetails(id: string) {
        const execution = await this.prismaService.cronJobExecution.findUnique({
            where: { id },
        });

        if (!execution) {
            throw new Error('Cron job execution not found');
        }

        return { data: execution };
    }

    /**
     * Get all executions of a specific job type with pagination
     */
    async getCronJobHistory(
        jobType: string,
        filters: {
            status?: string;
            startDate?: Date;
            endDate?: Date;
            page?: number;
            limit?: number;
        }
    ) {
        // Set default values - Last month
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const defaultEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const { 
            status, 
            startDate = defaultStartDate,
            endDate = defaultEndDate,
            page = 1, 
            limit = 10 
        } = filters;

        const where: any = { 
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

    /**
     * Get statistics for a specific job type
     */
    async getCronJobStats(jobType: string, days: number = 30) {
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

    /**
     * Retry a failed cron job
     */
    async retryCronJob(id: string) {
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
                    ...((execution.metadata as any) || {}),
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
        // lấy mới nhất của một job type
        const latestExecutions = await Promise.all(
            jobTypes.map(async ({ jobType }) => {
                return await this.prismaService.cronJobExecution.findFirst({
                    where: { jobType },
                    orderBy: { startedAt: 'desc' },
                });
            })
        )
        const formattedExecutions = latestExecutions
            .filter(job => job !== null)
            .map(job => this.formatJobExecution(job));
        return formattedExecutions
    }
}