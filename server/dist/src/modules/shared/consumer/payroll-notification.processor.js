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
var PayrollNotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollNotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const email_notification_payroll_service_1 = require("../services/email-notification-payroll.service");
let PayrollNotificationProcessor = PayrollNotificationProcessor_1 = class PayrollNotificationProcessor {
    constructor(emailService, prisma) {
        this.emailService = emailService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PayrollNotificationProcessor_1.name);
    }
    async handlePayrollNotification(job) {
        const { payrollId, executionId } = job.data;
        const errorDetails = [];
        try {
            const payroll = await this.prisma.payroll.findUnique({
                where: { id: payrollId },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!payroll || !payroll.teacher.user.email) {
                throw new Error('Payroll or teacher email not found');
            }
            const payrollInfo = {
                period: `${payroll.periodStart.toLocaleDateString('vi-VN')} - ${payroll.periodEnd.toLocaleDateString('vi-VN')}`,
                totalAmount: payroll.totalAmount.toString(),
                bonuses: payroll.bonuses.toString(),
                deductions: payroll.deductions.toString(),
                status: payroll.status,
            };
            await this.emailService.sendPayrollNotificationEmail({
                teacherName: payroll.teacher.user.fullName || 'Giáo viên',
                teacherEmail: payroll.teacher.user.email,
                payrollInfo,
                payrollId: payroll.id.toString(),
            });
            console.log("Cập nhật payroll");
            await this.prisma.payroll.update({
                where: { id: payrollId },
                data: {
                    status: 'waiting_teacher_approval',
                    adminPublishedAt: new Date(),
                },
            });
            if (executionId) {
                await this.prisma.cronJobExecution.update({
                    where: { id: executionId },
                    data: {
                        successCount: {
                            increment: 1,
                        },
                    },
                });
            }
            this.logger.log(` Payroll notification sent to ${payroll.teacher.user.email}`);
        }
        catch (error) {
            this.logger.error(' Failed to send payroll notification:', error);
            errorDetails.push({
                payrollId: payrollId.toString(),
                error: error?.message || 'Unknown error',
                timestamp: new Date().toISOString(),
            });
            if (executionId) {
                await this.prisma.cronJobExecution.update({
                    where: { id: executionId },
                    data: {
                        failedCount: {
                            increment: 1,
                        },
                        errorDetails: {
                            push: errorDetails[0],
                        },
                    },
                });
            }
            throw error;
        }
    }
};
exports.PayrollNotificationProcessor = PayrollNotificationProcessor;
__decorate([
    (0, bull_1.Process)('send-payroll-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollNotificationProcessor.prototype, "handlePayrollNotification", null);
exports.PayrollNotificationProcessor = PayrollNotificationProcessor = PayrollNotificationProcessor_1 = __decorate([
    (0, bull_1.Processor)('payroll-notification'),
    __metadata("design:paramtypes", [email_notification_payroll_service_1.EmailNotificationPayrollService,
        prisma_service_1.PrismaService])
], PayrollNotificationProcessor);
//# sourceMappingURL=payroll-notification.processor.js.map