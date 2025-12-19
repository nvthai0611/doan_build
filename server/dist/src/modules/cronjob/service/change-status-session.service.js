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
var ChangeStatusSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeStatusSessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let ChangeStatusSessionService = ChangeStatusSessionService_1 = class ChangeStatusSessionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ChangeStatusSessionService_1.name);
    }
    async changeStatusSession() {
        const startTime = Date.now();
        const jobType = 'change-status-session';
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
                        status: 'success',
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
            const result = await this.prisma.classSession.updateMany({
                where: {
                    status: 'happening'
                },
                data: {
                    status: 'end'
                }
            });
            await this.prisma.cronJobExecution.update({
                where: { id: cronJob.id },
                data: {
                    status: 'success',
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
        }
        catch (error) {
            this.logger.error('Lỗi khi chuyển trạng thái buổi học:', error);
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
    async manualChangeStatusSession() {
        this.logger.log('Chạy thủ công: Chuyển trạng thái buổi học');
        return this.changeStatusSession();
    }
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
};
exports.ChangeStatusSessionService = ChangeStatusSessionService;
__decorate([
    (0, schedule_1.Cron)('59 23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChangeStatusSessionService.prototype, "changeStatusSession", null);
exports.ChangeStatusSessionService = ChangeStatusSessionService = ChangeStatusSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChangeStatusSessionService);
//# sourceMappingURL=change-status-session.service.js.map