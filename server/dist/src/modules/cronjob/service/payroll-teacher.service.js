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
var PayrollCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../db/prisma.service");
let PayrollCronService = PayrollCronService_1 = class PayrollCronService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PayrollCronService_1.name);
    }
    async handleCalculateDailyPayouts() {
        const jobStartTime = new Date();
        this.logger.log('Starting daily teacher payout calculation job...', 'calculateDailyTeacherPayouts');
        let successCount = 0;
        let failedCount = 0;
        const errors = [];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let sessionsToProcess = [];
        try {
            sessionsToProcess = await this.prisma.classSession.findMany({
                where: {
                    sessionDate: {
                        gte: yesterday,
                        lt: today,
                    },
                    status: 'end',
                    teacherSessionPayout: null,
                },
                include: {
                    class: {
                        select: {
                            feeAmount: true,
                        },
                    },
                },
            });
            if (sessionsToProcess.length === 0) {
                this.logger.log('No sessions found to process for yesterday.', 'calculateDailyTeacherPayouts');
            }
            for (const session of sessionsToProcess) {
                try {
                    const teacherId = session.substituteTeacherId || session.teacherId;
                    if (!teacherId) {
                        throw new Error(`Session ${session.id} has no teacher or substitute teacher assigned.`);
                    }
                    const studentCount = await this.prisma.studentSessionAttendance.count({
                        where: {
                            sessionId: session.id,
                            status: {
                                not: 'excused'
                            },
                        },
                    });
                    const sessionFeePerStudent = session.class.feeAmount || new client_1.Prisma.Decimal(0);
                    const payoutRate = new client_1.Prisma.Decimal(0.4);
                    const totalRevenue = sessionFeePerStudent.mul(studentCount);
                    const teacherPayout = totalRevenue.mul(payoutRate);
                    await this.prisma.teacherSessionPayout.create({
                        data: {
                            sessionId: session.id,
                            teacherId: teacherId,
                            payrollId: null,
                            sessionFeePerStudent: sessionFeePerStudent,
                            studentCount: studentCount,
                            totalRevenue: totalRevenue,
                            payoutRate: payoutRate,
                            teacherPayout: teacherPayout,
                            calculatedAt: new Date(),
                            status: 'calculated',
                        },
                    });
                    successCount++;
                }
                catch (error) {
                    failedCount++;
                    const errorMessage = `Failed to process session ${session.id}: ${error.message}`;
                    this.logger.error(errorMessage, error.stack, 'calculateDailyTeacherPayouts');
                    errors.push({
                        itemId: session.id,
                        itemName: `Session ${session.id}`,
                        error: error.message,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Critical error during job execution: ${error.message}`, error.stack, 'calculateDailyTeacherPayouts');
            await this.prisma.cronJobExecution.create({
                data: {
                    jobType: 'daily_teacher_payout',
                    status: 'failed',
                    startedAt: jobStartTime,
                    completedAt: new Date(),
                    totalItems: sessionsToProcess.length,
                    errorMessage: `Job failed to start or query: ${error.message}`,
                    durationMs: new Date().getTime() - jobStartTime.getTime(),
                },
            });
            return;
        }
        const jobDuration = new Date().getTime() - jobStartTime.getTime();
        const jobStatus = failedCount > 0
            ? sessionsToProcess.length === failedCount
                ? 'failed'
                : 'completed_with_errors'
            : 'success';
        await this.prisma.cronJobExecution.create({
            data: {
                jobType: 'daily_teacher_payout',
                status: jobStatus,
                startedAt: jobStartTime,
                completedAt: new Date(),
                totalItems: sessionsToProcess.length,
                successCount: successCount,
                failedCount: failedCount,
                errorMessage: failedCount > 0
                    ? `${failedCount}/${sessionsToProcess.length} sessions failed to process.`
                    : null,
                errorDetails: errors.length > 0 ? errors : client_1.Prisma.JsonNull,
                durationMs: jobDuration,
            },
        });
        this.logger.log(`Finished daily payout calculation job. Total: ${sessionsToProcess.length}, Success: ${successCount}, Failed: ${failedCount}. Duration: ${jobDuration}ms`, 'calculateDailyTeacherPayouts');
    }
    async handleGenerateMonthlyPayrolls() {
        const jobStartTime = new Date();
        this.logger.log('Starting monthly payroll generation job...', 'generateMonthlyTeacherPayrolls');
        let successCount = 0;
        let failedCount = 0;
        let totalTeachers = 0;
        const errors = [];
        const today = new Date();
        const periodEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        periodEnd.setHours(23, 59, 59, 999);
        const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
        periodStart.setHours(0, 0, 0, 0);
        this.logger.log(`Processing payroll for period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`, 'generateMonthlyTeacherPayrolls');
        let teacherIdsToProcess = [];
        try {
            const distinctPayouts = await this.prisma.teacherSessionPayout.findMany({
                where: {
                    status: 'calculated',
                    session: {
                        sessionDate: {
                            gte: periodStart,
                            lte: periodEnd,
                        },
                    },
                },
                select: {
                    teacherId: true,
                },
                distinct: ['teacherId'],
            });
            teacherIdsToProcess = distinctPayouts.map((p) => p.teacherId);
            totalTeachers = teacherIdsToProcess.length;
            if (totalTeachers === 0) {
                this.logger.log('No teachers with calculated payouts found for this period.', 'generateMonthlyTeacherPayrolls');
            }
            for (const teacherId of teacherIdsToProcess) {
                try {
                    const payoutsToBatch = await this.prisma.teacherSessionPayout.findMany({
                        where: {
                            teacherId: teacherId,
                            status: 'calculated',
                            session: {
                                sessionDate: {
                                    gte: periodStart,
                                    lte: periodEnd,
                                },
                            },
                        },
                    });
                    if (payoutsToBatch.length === 0) {
                        continue;
                    }
                    const totalAmount = payoutsToBatch.reduce((sum, p) => sum.add(p.teacherPayout), new client_1.Prisma.Decimal(0));
                    const payoutIdsAsBigInt = payoutsToBatch.map((p) => p.id);
                    const payoutIdsAsString = payoutIdsAsBigInt.map((id) => id.toString());
                    await this.prisma.$transaction(async (tx) => {
                        const newPayroll = await tx.payroll.create({
                            data: {
                                teacherId: teacherId,
                                periodStart: periodStart,
                                periodEnd: periodEnd,
                                totalAmount: totalAmount,
                                status: 'pending',
                                computedDetails: {
                                    sessionCount: payoutsToBatch.length,
                                    payoutIds: payoutIdsAsString,
                                    generatedAt: jobStartTime.toISOString(),
                                },
                            },
                        });
                        await tx.teacherSessionPayout.updateMany({
                            where: {
                                id: {
                                    in: payoutIdsAsBigInt,
                                },
                            },
                            data: {
                                status: 'batched',
                                payrollId: newPayroll.id,
                            },
                        });
                    });
                    successCount++;
                }
                catch (error) {
                    failedCount++;
                    const errorMessage = `Failed to process payroll for teacher ${teacherId}: ${error.message}`;
                    this.logger.error(errorMessage, error.stack, 'generateMonthlyTeacherPayrolls');
                    errors.push({
                        itemId: teacherId,
                        itemName: `Teacher ${teacherId}`,
                        error: error.message,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Critical error during monthly payroll job: ${error.message}`, error.stack, 'generateMonthlyTeacherPayrolls');
            await this.prisma.cronJobExecution.create({
                data: {
                    jobType: 'monthly_payroll_generation',
                    status: 'failed',
                    startedAt: jobStartTime,
                    completedAt: new Date(),
                    totalItems: teacherIdsToProcess.length,
                    errorMessage: `Job failed during query or setup: ${error.message}`,
                    durationMs: new Date().getTime() - jobStartTime.getTime(),
                },
            });
            return;
        }
        const jobDuration = new Date().getTime() - jobStartTime.getTime();
        const jobStatus = failedCount > 0
            ? totalTeachers === failedCount
                ? 'failed'
                : 'completed_with_errors'
            : 'success';
        await this.prisma.cronJobExecution.create({
            data: {
                jobType: 'monthly_payroll_generation',
                status: jobStatus,
                startedAt: jobStartTime,
                completedAt: new Date(),
                totalItems: totalTeachers,
                successCount: successCount,
                failedCount: failedCount,
                errorMessage: failedCount > 0
                    ? `${failedCount}/${totalTeachers} teacher payrolls failed to generate.`
                    : null,
                errorDetails: errors.length > 0 ? errors : client_1.Prisma.JsonNull,
                durationMs: jobDuration,
                metadata: {
                    periodStart: periodStart.toISOString(),
                    periodEnd: periodEnd.toISOString(),
                }
            },
        });
        this.logger.log(`Finished monthly payroll job. Total Teachers: ${totalTeachers}, Success: ${successCount}, Failed: ${failedCount}. Duration: ${jobDuration}ms`, 'generateMonthlyTeacherPayrolls');
    }
};
exports.PayrollCronService = PayrollCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM, {
        name: 'calculateDailyTeacherPayouts',
        timeZone: 'Asia/Ho_Chi_Minh',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollCronService.prototype, "handleCalculateDailyPayouts", null);
__decorate([
    (0, schedule_1.Cron)('0 2 7 * *', {
        name: 'generateMonthlyTeacherPayrolls',
        timeZone: 'Asia/Ho_Chi_Minh',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollCronService.prototype, "handleGenerateMonthlyPayrolls", null);
exports.PayrollCronService = PayrollCronService = PayrollCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollCronService);
//# sourceMappingURL=payroll-teacher.service.js.map