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
var RecalculatedPayrollTeacherProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecalculatedPayrollTeacherProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../db/prisma.service");
let RecalculatedPayrollTeacherProcessor = RecalculatedPayrollTeacherProcessor_1 = class RecalculatedPayrollTeacherProcessor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecalculatedPayrollTeacherProcessor_1.name);
    }
    roundMoney(amount) {
        return new client_1.Prisma.Decimal(amount.toFixed(0));
    }
    async handleRecalculation(job) {
        const { payrollId } = job.data;
        this.logger.log(`Bắt đầu job tính lại Payroll ID: ${payrollId}`);
        try {
            const idBig = BigInt(payrollId);
            const oldPayroll = await this.prisma.payroll.findUnique({
                where: { id: idBig },
                include: { teacher: true },
            });
            if (!oldPayroll) {
                this.logger.error(`Payroll ${payrollId} không tồn tại`);
                return;
            }
            if (!['pending', 'rejected_by_teacher'].includes(oldPayroll.status)) {
                this.logger.warn(`Payroll ${payrollId} trạng thái ${oldPayroll.status} không được phép tính lại.`);
                return;
            }
            const { teacherId, periodStart, periodEnd } = oldPayroll;
            const year = periodStart.getFullYear();
            const month = periodStart.getMonth();
            const studyMonthStart = new Date(Date.UTC(year, month, 1));
            const studyMonthEnd = new Date(Date.UTC(year, month + 1));
            const closingDate = new Date(Date.UTC(year, month + 1, 8));
            const previousClosingDate = new Date(Date.UTC(year, month, 8));
            const allContracts = await this.prisma.contractUpload.findMany({
                where: { teacherId, status: 'active' },
                orderBy: { uploadedAt: 'desc' },
                select: {
                    startDate: true,
                    expiredAt: true,
                    teacherSalaryPercent: true,
                },
            });
            const findRateInMemory = (date) => {
                const match = allContracts.find((c) => {
                    const startOk = !c.startDate || c.startDate <= date;
                    const endOk = !c.expiredAt || c.expiredAt >= date;
                    return startOk && endOk;
                });
                if (!match || !match.teacherSalaryPercent)
                    return new client_1.Prisma.Decimal(0);
                let rate = new client_1.Prisma.Decimal(match.teacherSalaryPercent);
                if (rate.gt(1))
                    rate = rate.dividedBy(100);
                return rate;
            };
            await this.prisma.$transaction(async (tx) => {
                await tx.teacherSessionPayout.deleteMany({
                    where: { payrollId: idBig },
                });
                await tx.payroll.delete({ where: { id: idBig } });
                const sessions = await tx.classSession.findMany({
                    where: {
                        sessionDate: { gte: studyMonthStart, lt: studyMonthEnd },
                        status: 'end',
                        OR: [{ teacherId }, { substituteTeacherId: teacherId }],
                    },
                    include: {
                        class: {
                            select: {
                                id: true,
                                feeAmount: true,
                                feeStructure: { select: { amount: true } },
                            },
                        },
                    },
                });
                let currentMonthSalary = new client_1.Prisma.Decimal(0);
                const newPayoutIds = [];
                const sessionsByClass = new Map();
                for (const s of sessions) {
                    const list = sessionsByClass.get(s.classId) || [];
                    list.push(s);
                    sessionsByClass.set(s.classId, list);
                }
                for (const [classId, classSessions] of sessionsByClass) {
                    const cls = classSessions[0].class;
                    const realSessionFee = cls.feeAmount || cls.feeStructure?.amount || new client_1.Prisma.Decimal(0);
                    const feeRecords = await tx.feeRecord.findMany({
                        where: {
                            classId: classId,
                            dueDate: { gt: previousClosingDate, lt: closingDate },
                            status: 'paid',
                            feeRecordPayments: {
                                some: { payment: { paidAt: { lt: closingDate } } },
                            },
                        },
                        select: { id: true, totalAmount: true, amount: true },
                    });
                    const totalRevenue = feeRecords.reduce((sum, r) => sum.plus(r.totalAmount || r.amount), new client_1.Prisma.Decimal(0));
                    const totalClassSessions = await tx.classSession.count({
                        where: {
                            classId,
                            sessionDate: { gte: studyMonthStart, lt: studyMonthEnd },
                            status: 'end',
                        },
                    });
                    if (totalRevenue.isZero() || totalClassSessions === 0)
                        continue;
                    const rawValuePerSession = this.roundMoney(totalRevenue).dividedBy(totalClassSessions);
                    for (const session of classSessions) {
                        const newRate = findRateInMemory(session.sessionDate);
                        const teacherPayout = this.roundMoney(rawValuePerSession.times(newRate));
                        const attendanceCount = await tx.studentSessionAttendance.count({
                            where: { sessionId: session.id, status: { not: 'excused' } },
                        });
                        const tsp = await tx.teacherSessionPayout.create({
                            data: {
                                sessionId: session.id,
                                teacherId: teacherId,
                                status: 'batched',
                                studentCount: attendanceCount,
                                sessionFeePerStudent: realSessionFee,
                                totalRevenue: rawValuePerSession,
                                payoutRate: newRate,
                                teacherPayout: teacherPayout,
                            },
                        });
                        newPayoutIds.push(tsp.id);
                        currentMonthSalary = currentMonthSalary.plus(teacherPayout);
                    }
                }
                let backPayTotal = new client_1.Prisma.Decimal(0);
                const backPayDetails = [];
                const latePayments = await tx.feeRecordPayment.findMany({
                    where: {
                        payment: { paidAt: { gte: previousClosingDate, lt: closingDate } },
                        feeRecord: {
                            dueDate: { lt: previousClosingDate },
                            status: 'paid',
                            class: { teacherId: teacherId },
                        },
                    },
                    include: {
                        feeRecord: {
                            include: {
                                student: {
                                    include: {
                                        user: true,
                                    },
                                },
                                class: true,
                            },
                        },
                        payment: true,
                    },
                });
                const allHistoryPayouts = await tx.teacherSessionPayout.findMany({
                    where: {
                        teacherId: teacherId,
                    },
                    select: {
                        payoutRate: true,
                        session: {
                            select: {
                                classId: true,
                                sessionDate: true,
                            },
                        },
                    },
                });
                const payoutRateCache = new Map();
                for (const hp of allHistoryPayouts) {
                    const sessionDate = hp.session.sessionDate;
                    const key = `${hp.session.classId}_${sessionDate.getFullYear()}_${sessionDate.getMonth()}`;
                    if (!payoutRateCache.has(key)) {
                        payoutRateCache.set(key, hp.payoutRate);
                    }
                }
                for (const p of latePayments) {
                    const feeRecord = p.feeRecord;
                    if (!feeRecord || !feeRecord.classId)
                        continue;
                    const paymentAmount = feeRecord.totalAmount || feeRecord.amount;
                    const studentName = feeRecord.student?.user?.fullName || 'HS';
                    const className = feeRecord.class?.name || 'Lớp';
                    const debtDate = feeRecord.dueDate;
                    const dY = debtDate.getFullYear();
                    const dM = debtDate.getMonth();
                    const debtMonthStart = new Date(Date.UTC(dY, dM, 1));
                    const debtMonthEnd = new Date(Date.UTC(dY, dM + 1, 1));
                    let finalRate;
                    const cacheKey = `${feeRecord.classId}_${dY}_${dM}`;
                    const cachedRate = payoutRateCache.get(cacheKey);
                    if (cachedRate) {
                        finalRate = cachedRate;
                    }
                    else {
                        finalRate = findRateInMemory(debtDate);
                        this.logger.warn(`Không tìm thấy lịch sử bảng lương tháng ${dM + 1}/${dY} cho GV ${teacherId}. Dùng tỷ lệ theo hợp đồng.`);
                    }
                    if (finalRate.isZero())
                        continue;
                    const payout = this.roundMoney(paymentAmount.times(finalRate));
                    backPayTotal = backPayTotal.plus(payout);
                    backPayDetails.push({
                        feeRecordId: feeRecord.id,
                        sessionId: 'BACKPAY',
                        sessionDate: p.payment.paidAt.toISOString().slice(0, 10),
                        description: `Lương cũ T${dM + 1}: ${className} (${studentName}) - tỷ lệ áp dụng: ${finalRate.times(100)}%`,
                        revenuePerSession: paymentAmount.toNumber(),
                        payoutRate: finalRate.toNumber(),
                        payoutAmount: payout.toNumber(),
                    });
                }
                const totalAmount = currentMonthSalary.plus(backPayTotal);
                const metadata = {
                    totalSessions: newPayoutIds.length,
                    totalSessionPayouts: currentMonthSalary.toFixed(0),
                    backPayCount: backPayDetails.length,
                    backPayTotal: backPayTotal.toFixed(0),
                    processedAt: new Date().toISOString(),
                    note: 'Lương Quỹ Lớp + Lương từ buổi học cũ (Tính lại)',
                };
                const newPayroll = await tx.payroll.create({
                    data: {
                        teacherId,
                        periodStart,
                        periodEnd,
                        totalAmount,
                        backPayAmount: backPayTotal,
                        bonuses: 0,
                        computedDetails: { metadata, backPayDetails },
                        status: 'pending',
                    },
                });
                if (newPayoutIds.length > 0) {
                    await tx.teacherSessionPayout.updateMany({
                        where: { id: { in: newPayoutIds } },
                        data: { payrollId: newPayroll.id },
                    });
                }
            }, {
                timeout: 60000,
                maxWait: 20000,
            });
            this.logger.log(`Đã tính lại xong Payroll cho GV ${teacherId}`);
        }
        catch (error) {
            this.logger.error(`Lỗi tính lại Payroll ${payrollId}:`, error);
            throw error;
        }
    }
};
exports.RecalculatedPayrollTeacherProcessor = RecalculatedPayrollTeacherProcessor;
__decorate([
    (0, bull_1.Process)('recalculate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecalculatedPayrollTeacherProcessor.prototype, "handleRecalculation", null);
exports.RecalculatedPayrollTeacherProcessor = RecalculatedPayrollTeacherProcessor = RecalculatedPayrollTeacherProcessor_1 = __decorate([
    (0, bull_1.Processor)('payroll-recalculation'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecalculatedPayrollTeacherProcessor);
//# sourceMappingURL=recalculate-payroll-teacher.js.map