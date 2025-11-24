import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class ChangeStatusSessionService {
    private readonly logger = new Logger(ChangeStatusSessionService.name);
    
    constructor(private prisma: PrismaService) {}

    // Chuyển trạng thái buổi học từ happening sang end lúc 23h59 cuối ngày
    @Cron('59 23 * * *')
    async changeStatusSession() {
        const startTime = Date.now();
        const jobType = 'change-status-session';
        
        // Tạo job execution record
        const cronJob = await this.prisma.cronJobExecution.create({
            data: {
                jobType,
                status: 'running',
                startedAt: new Date(),
                metadata: {
                    description: 'Chuyển trạng thái buổi học từ happening sang end',
                    scheduledTime: new Date().toISOString()
                }
            }
        });

        try {
            // Đếm số lượng sessions cần update
            const sessionsToUpdate = await this.prisma.classSession.count({
                where: {
                    status: 'happening'
                }
            });

            if (sessionsToUpdate === 0) {
                this.logger.log('Không có buổi học nào cần chuyển trạng thái');
                
                await this.prisma.cronJobExecution.update({
                    where: { id: cronJob.id },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        durationMs: Date.now() - startTime,
                        totalItems: 0,
                        successCount: 0,
                        failedCount: 0,
                        errorMessage: null
                    }
                });

                return;
            }

            // Cập nhật trạng thái
            const result = await this.prisma.classSession.updateMany({
                where: {
                    status: 'happening'
                },
                data: {
                    status: 'end'
                }
            });

            // Cập nhật job execution với kết quả thành công
            await this.prisma.cronJobExecution.update({
                where: { id: cronJob.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    durationMs: Date.now() - startTime,
                    totalItems: sessionsToUpdate,
                    successCount: result.count,
                    failedCount: 0,
                    metadata: {
                        description: 'Chuyển trạng thái buổi học từ happening sang end',
                        scheduledTime: new Date().toISOString(),
                        updatedCount: result.count
                    }
                }
            });

            this.logger.log(`Đã chuyển trạng thái ${result.count} buổi học thành công`);

        } catch (error) {
            this.logger.error('Lỗi khi chuyển trạng thái buổi học:', error);

            // Cập nhật job execution với trạng thái failed
            await this.prisma.cronJobExecution.update({
                where: { id: cronJob.id },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    durationMs: Date.now() - startTime,
                    errorMessage: `Có lỗi xảy ra khi chuyển trạng thái buổi học: ${error?.message || error}`,
                    errorDetails: {
                        error: error?.message || String(error),
                        stack: error?.stack,
                        timestamp: new Date().toISOString()
                    }
                }
            });

            throw error;
        }
    }

    // Method để chạy thủ công nếu cần
    async manualChangeStatusSession() {
        this.logger.log('Chạy thủ công: Chuyển trạng thái buổi học');
        return this.changeStatusSession();
    }

    // Method để lấy lịch sử cronjob
    async getCronJobHistory(limit = 10) {
        return this.prisma.cronJobExecution.findMany({
            where: {
                jobType: 'change-status-session'
            },
            orderBy: {
                startedAt: 'desc'
            },
            take: limit
        });
    }

    // Method để lấy thống kê cronjob
    async getCronJobStats() {
        const stats = await this.prisma.cronJobExecution.groupBy({
            by: ['status'],
            where: {
                jobType: 'change-status-session'
            },
            _count: {
                status: true
            },
            _avg: {
                durationMs: true
            },
            _sum: {
                totalItems: true,
                successCount: true,
                failedCount: true
            }
        });

        return {
            jobType: 'change-status-session',
            stats: stats.map(stat => ({
                status: stat.status,
                count: stat._count.status,
                averageDurationMs: Math.round(stat._avg.durationMs || 0),
                totalItemsProcessed: stat._sum.totalItems || 0,
                totalSuccess: stat._sum.successCount || 0,
                totalFailed: stat._sum.failedCount || 0
            }))
        };
    }
}