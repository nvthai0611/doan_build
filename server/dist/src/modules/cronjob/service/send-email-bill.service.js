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
var FeeReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../db/prisma.service");
const email_notification_bill_service_1 = require("../../shared/services/email-notification-bill.service");
let FeeReminderService = FeeReminderService_1 = class FeeReminderService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(FeeReminderService_1.name);
    }
    async handleEarlyFeeReminder() {
        this.logger.log('🔔 Running early fee reminder job...');
        await this.processFeeReminders('early');
    }
    async handleDueFeeReminder() {
        this.logger.log('🔔 Running due date fee reminder job...');
        await this.processFeeReminders('due');
    }
    async processFeeReminders(type) {
        const executionId = await this.createJobExecution(type);
        try {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: {
                    status: {
                        in: ['pending', 'processing'],
                    },
                    dueDate: {
                        gte: new Date(currentYear, currentMonth - 1, 1),
                        lte: new Date(currentYear, currentMonth, 0),
                    },
                },
                include: {
                    student: {
                        include: {
                            user: true,
                            parent: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                    class: {
                        include: {
                            subject: true,
                            grade: true,
                        },
                    },
                    feeStructure: true,
                },
            });
            this.logger.log(`📊 Found ${feeRecords.length} fee records to process`);
            let successCount = 0;
            let failedCount = 0;
            const errorDetails = [];
            const feesByParent = this.groupFeesByParent(feeRecords);
            for (const [parentId, fees] of Object.entries(feesByParent)) {
                try {
                    const parent = fees[0].student.parent;
                    if (!parent?.user?.email) {
                        throw new Error('Parent email not found');
                    }
                    await this.emailService.sendFeeReminderEmail({
                        type,
                        parentEmail: parent.user.email,
                        parentName: parent.user.fullName || 'Quý phụ huynh',
                        feeRecords: fees,
                        dueDate: fees[0].dueDate,
                    });
                    successCount++;
                }
                catch (error) {
                    failedCount++;
                    errorDetails.push({
                        itemId: parentId,
                        itemName: fees[0].student.parent?.user?.fullName || 'Unknown',
                        error: error.message,
                    });
                    this.logger.error(`❌ Failed to send reminder to parent ${parentId}:`, error.stack);
                }
            }
            await this.updateJobExecution(executionId, {
                status: 'success',
                totalItems: Object.keys(feesByParent).length,
                successCount,
                failedCount,
                errorDetails: errorDetails.length > 0 ? errorDetails : null,
            });
            this.logger.log(`✅ Job completed: ${successCount} success, ${failedCount} failed`);
        }
        catch (error) {
            this.logger.error('❌ Job failed:', error.stack);
            await this.updateJobExecution(executionId, {
                status: 'failed',
                errorMessage: error.message,
            });
        }
    }
    groupFeesByParent(feeRecords) {
        const grouped = {};
        for (const fee of feeRecords) {
            const parentId = fee.student.parentId;
            if (!parentId)
                continue;
            if (!grouped[parentId]) {
                grouped[parentId] = [];
            }
            grouped[parentId].push(fee);
        }
        return grouped;
    }
    async createJobExecution(type) {
        const job = await this.prisma.cronJobExecution.create({
            data: {
                jobType: `fee_reminder_${type}`,
                status: 'running',
                metadata: {
                    reminderType: type,
                    executedAt: new Date().toISOString(),
                },
            },
        });
        return job.id;
    }
    async updateJobExecution(id, data) {
        const completedAt = data.status === 'success' || data.status === 'failed'
            ? new Date()
            : undefined;
        const startedAt = await this.prisma.cronJobExecution
            .findUnique({ where: { id }, select: { startedAt: true } })
            .then((j) => j?.startedAt);
        const durationMs = completedAt && startedAt
            ? completedAt.getTime() - startedAt.getTime()
            : undefined;
        await this.prisma.cronJobExecution.update({
            where: { id },
            data: {
                ...data,
                completedAt,
                durationMs,
            },
        });
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    }
};
exports.FeeReminderService = FeeReminderService;
__decorate([
    (0, schedule_1.Cron)('0 8 3 * *', {
        name: 'early-fee-reminder',
        timeZone: 'Asia/Ho_Chi_Minh',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeeReminderService.prototype, "handleEarlyFeeReminder", null);
__decorate([
    (0, schedule_1.Cron)('0 8 6 * *', {
        name: 'due-fee-reminder',
        timeZone: 'Asia/Ho_Chi_Minh',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeeReminderService.prototype, "handleDueFeeReminder", null);
exports.FeeReminderService = FeeReminderService = FeeReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_notification_bill_service_1.EmailServiceNotificationBill])
], FeeReminderService);
//# sourceMappingURL=send-email-bill.service.js.map