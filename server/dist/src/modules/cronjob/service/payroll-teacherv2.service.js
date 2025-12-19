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
        this.JOB_TYPE = 'teacher_payroll_generation';
    }
    roundMoney(amount) {
        return new client_1.Prisma.Decimal(amount.toFixed(0));
    }
    toDbDate(date) {
        return new Date(date.getTime() + 7 * 60 * 60 * 1000);
    }
    async handleGenerateTeacherPayroll() {
        this.logger.log('🚀 Bắt đầu Cron Job: Tính Lương (Quỹ Lớp & Truy Lĩnh)...');
        const startTime = Date.now();
        const execution = await this.prisma.cronJobExecution.create({
            data: {
                jobType: this.JOB_TYPE,
                status: 'running',
                startedAt: new Date(),
                metadata: { type: 'monthly_closing_pool_based' },
            },
        });
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const studyMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
        const studyMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 1));
        studyMonthEnd.setHours(23, 59, 59, 999);
        const billingMonthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
        const billingMonthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 1));
        const closingDate = new Date(Date.UTC(currentYear, currentMonth, 8));
        const previousClosingDate = new Date(Date.UTC(currentYear, currentMonth - 1, 8));
        const fmtDate = (d) => {
            return d.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        };
        const fmtDateTime = (d) => {
            return d.toLocaleString('vi-VN', { hour12: false });
        };
        this.logger.log(`Kỳ Học: ${fmtDate(studyMonthStart)} -> ${fmtDate(studyMonthEnd)}`);
        this.logger.log(`Kỳ Hóa Đơn: ${fmtDate(billingMonthStart)} -> ${fmtDate(billingMonthEnd)}`);
        this.logger.log(`Quét thanh toán từ: ${fmtDateTime(previousClosingDate)} -> ${fmtDateTime(closingDate)}`);
        let totalSuccess = 0;
        let totalFailed = 0;
        let allErrors = [];
        try {
            this.logger.log('--- Giai đoạn 1: Tính Quỹ Lớp ---');
            const phase1Result = await this.processCurrentMonthPools(studyMonthStart, studyMonthEnd, previousClosingDate, billingMonthEnd, closingDate);
            totalSuccess += phase1Result.success;
            totalFailed += phase1Result.failed;
            allErrors = [...allErrors, ...phase1Result.errors];
            this.logger.log('--- Giai đoạn 2: Tính Truy Lĩnh ---');
            const phase2Result = await this.processBackPay(previousClosingDate, closingDate, previousClosingDate);
            totalSuccess += phase2Result.success;
            totalFailed += phase2Result.failed;
            allErrors = [...allErrors, ...phase2Result.errors];
            const backPayMap = phase2Result.data || new Map();
            this.logger.log('--- Giai đoạn 3: Tổng hợp Payroll ---');
            const phase3Result = await this.aggregateAndCreatePayrolls(studyMonthStart, studyMonthEnd, backPayMap);
            totalSuccess += phase3Result.success;
            totalFailed += phase3Result.failed;
            allErrors = [...allErrors, ...phase3Result.errors];
            const finalStatus = totalFailed > 0 ? 'completed_with_errors' : 'success';
            await this.prisma.cronJobExecution.update({
                where: { id: execution.id },
                data: {
                    status: finalStatus,
                    completedAt: new Date(),
                    durationMs: Date.now() - startTime,
                    totalItems: totalSuccess + totalFailed,
                    successCount: totalSuccess,
                    failedCount: totalFailed,
                    errorDetails: allErrors,
                    errorMessage: totalFailed > 0 ? `Hoàn thành với ${totalFailed} lỗi xử lý item.` : null,
                },
            });
            this.logger.log(`✅ Cron Job hoàn tất. Success: ${totalSuccess}, Failed: ${totalFailed}`);
        }
        catch (error) {
            this.logger.error('❌ Cron Job CRASHED:', error);
            await this.prisma.cronJobExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    durationMs: Date.now() - startTime,
                    errorMessage: error instanceof Error ? error.message : 'Unknown system error',
                    errorDetails: allErrors,
                },
            });
        }
    }
    async getTeacherRate(teacherId, date) {
        const contract = await this.prisma.contractUpload.findFirst({
            where: {
                teacherId: teacherId,
                status: 'active',
                AND: [
                    { OR: [{ startDate: { lte: date } }, { startDate: null }] },
                    { OR: [{ expiredAt: { gte: date } }, { expiredAt: null }] },
                ],
            },
            orderBy: { uploadedAt: 'desc' },
            select: { teacherSalaryPercent: true },
        });
        if (!contract || !contract.teacherSalaryPercent)
            return new client_1.Prisma.Decimal(0);
        let rate = new client_1.Prisma.Decimal(contract.teacherSalaryPercent);
        if (rate.gt(1))
            rate = rate.dividedBy(100);
        return rate;
    }
    async processCurrentMonthPools(studyStart, studyEnd, previousClosingDate, billingEnd, closingDate) {
        let success = 0;
        let failed = 0;
        const errors = [];
        const activeClasses = await this.prisma.class.findMany({
            where: {
                sessions: {
                    some: { sessionDate: { gte: studyStart, lt: studyEnd }, status: 'end' },
                },
            },
            select: { id: true, name: true },
        });
        console.log("Tính toán các buổi học để tính lương: ");
        console.log(studyStart, studyEnd);
        for (const cls of activeClasses) {
            try {
                const feeRecords = await this.prisma.feeRecord.findMany({
                    where: {
                        classId: cls.id,
                        dueDate: { gt: previousClosingDate, lt: billingEnd },
                        status: 'paid',
                        feeRecordPayments: {
                            some: { payment: { paidAt: { lt: closingDate } } },
                        },
                    },
                    select: { totalAmount: true, amount: true },
                });
                console.log(previousClosingDate, billingEnd, closingDate);
                console.log(feeRecords, feeRecords.length);
                console.log("Lớp học hoạt động trong tháng: ", cls.name);
                const totalRevenue = feeRecords.reduce((sum, rec) => sum.plus(rec.totalAmount ?? rec.amount), new client_1.Prisma.Decimal(0));
                console.log(`Tổng doanh thu lớp ${cls.name}:`, new Intl.NumberFormat('vi-VN').format(totalRevenue.toNumber()));
                const sessions = await this.prisma.classSession.findMany({
                    where: {
                        classId: cls.id,
                        sessionDate: { gte: studyStart, lt: studyEnd },
                        status: 'end',
                        teacherSessionPayout: { is: null }
                    },
                    select: { id: true, teacherId: true, substituteTeacherId: true, sessionDate: true },
                });
                console.log(studyStart, studyEnd);
                console.log(cls.id);
                const totalSessions = sessions.length;
                console.log("Các buổi dạy trong tháng của lớp: ", totalSessions);
                if (totalRevenue.isZero() || totalSessions === 0) {
                    success++;
                    continue;
                }
                const rawValuePerSession = this.roundMoney(totalRevenue).dividedBy(totalSessions);
                console.log("Số tiền trên 1 buổi: ", rawValuePerSession);
                for (const session of sessions) {
                    const personToPayId = session.substituteTeacherId || session.teacherId;
                    if (!personToPayId)
                        continue;
                    const teacherRate = await this.getTeacherRate(personToPayId, session.sessionDate);
                    if (teacherRate.isZero())
                        continue;
                    console.log("% Lương tháng này của giáo viên: ", teacherRate.toNumber());
                    const teacherPayout = this.roundMoney(rawValuePerSession.times(teacherRate));
                    console.log("Tiền lương giáo viên nhận được cho buổi: ", teacherPayout.toNumber());
                    const attendanceCount = await this.prisma.studentSessionAttendance.count({
                        where: { sessionId: session.id, status: { not: 'excused' } },
                    });
                    console.log("Số học sinh tham gia buổi: ", attendanceCount);
                    await this.prisma.teacherSessionPayout.create({
                        data: {
                            sessionId: session.id,
                            teacherId: personToPayId,
                            status: 'calculated',
                            studentCount: attendanceCount,
                            sessionFeePerStudent: 0,
                            totalRevenue: this.roundMoney(rawValuePerSession),
                            payoutRate: teacherRate,
                            teacherPayout: teacherPayout,
                        },
                    });
                }
                success++;
            }
            catch (err) {
                failed++;
                errors.push({
                    itemId: cls.id,
                    itemName: `Lớp ${cls.name}`,
                    phase: 'Giai đoạn 1 (Quỹ Lớp)',
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
                this.logger.error(`Lỗi xử lý lớp ${cls.id}:`, err);
            }
        }
        return { success, failed, errors };
    }
    async processBackPay(paymentWindowStart, paymentWindowEnd, currentBillingStart) {
        let success = 0;
        let failed = 0;
        const errors = [];
        const backPayMap = new Map();
        const latePayments = await this.prisma.feeRecordPayment.findMany({
            where: {
                payment: { paidAt: { gte: paymentWindowStart, lt: paymentWindowEnd } },
                feeRecord: { dueDate: { lt: currentBillingStart }, status: 'paid' },
            },
            include: {
                feeRecord: {
                    include: {
                        class: { select: { id: true, teacherId: true, name: true } },
                        student: { select: { user: { select: { fullName: true } } } },
                    },
                },
            },
        });
        if (latePayments.length === 0) {
            return { success: 0, failed: 0, errors: [], data: backPayMap };
        }
        for (const p of latePayments) {
            const feeRecord = p.feeRecord;
            if (!feeRecord || !feeRecord.classId)
                continue;
            try {
                const paymentAmount = feeRecord.totalAmount || feeRecord.amount;
                const studentName = feeRecord.student?.user?.fullName || 'HS';
                const className = feeRecord.class?.name || 'Lớp';
                const targetTeacherId = feeRecord.class?.teacherId;
                if (!targetTeacherId) {
                    this.logger.warn(`Không tìm thấy GV chính để trả nợ HĐ ${feeRecord.id} (Lớp ${className})`);
                    success++;
                    continue;
                }
                let finalRate;
                const debtDate = feeRecord.dueDate;
                const dY = debtDate.getFullYear();
                const dM = debtDate.getMonth();
                const debtMonthStart = new Date(Date.UTC(dY, dM, 1));
                const debtMonthEnd = new Date(Date.UTC(dY, dM + 1, 1));
                const historyPayout = await this.prisma.teacherSessionPayout.findFirst({
                    where: {
                        teacherId: targetTeacherId,
                        session: {
                            classId: feeRecord.classId,
                            sessionDate: { gte: debtMonthStart, lt: debtMonthEnd },
                        },
                    },
                    select: { payoutRate: true },
                });
                if (historyPayout) {
                    finalRate = historyPayout.payoutRate;
                }
                else {
                    finalRate = await this.getTeacherRate(targetTeacherId, debtDate);
                    this.logger.warn(`Hóa đơn cũ: Không tìm thấy lịch sử bảng lương tháng ${debtDate.getMonth() + 1} cho GV ${targetTeacherId}. Dùng tỷ lệ theo hợp đồng.`);
                }
                if (finalRate.isZero()) {
                    success++;
                    continue;
                }
                const teacherPayout = this.roundMoney(paymentAmount.times(finalRate));
                if (!backPayMap.has(targetTeacherId)) {
                    backPayMap.set(targetTeacherId, {
                        amount: new client_1.Prisma.Decimal(0),
                        details: [],
                    });
                }
                const entry = backPayMap.get(targetTeacherId);
                entry.amount = entry.amount.plus(teacherPayout);
                entry.details.push({
                    feeRecordId: feeRecord.id,
                    sessionId: 'BACKPAY',
                    sessionDate: debtDate.toISOString().slice(0, 10),
                    description: `Lương cũ T${debtDate.getMonth() + 1}: ${className} (${studentName}) - tỷ lệ áp dụng: ${finalRate.times(100)}%`,
                    revenuePerSession: paymentAmount.toNumber(),
                    payoutRate: finalRate.toNumber(),
                    payoutAmount: teacherPayout.toNumber(),
                });
                success++;
            }
            catch (err) {
                failed++;
                errors.push({
                    itemId: p.id.toString(),
                    itemName: `Payment ID ${p.id}`,
                    phase: 'Giai đoạn 2 (Truy Lĩnh Nợ Cũ)',
                    error: err instanceof Error ? err.message : 'Lỗi không xác định',
                });
                this.logger.error(`Lỗi xử lý BackPay ID ${p.id}:`, err);
            }
        }
        return { success, failed, errors, data: backPayMap };
    }
    async aggregateAndCreatePayrolls(startDate, endDate, backPayMap) {
        let success = 0;
        let failed = 0;
        const errors = [];
        const newPayouts = await this.prisma.teacherSessionPayout.findMany({
            where: {
                status: 'calculated',
                session: { sessionDate: { gte: startDate, lt: endDate } },
            },
        });
        const displayPeriodEnd = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), 0));
        const currentPayMap = new Map();
        const payoutIdsMap = new Map();
        for (const payout of newPayouts) {
            const tid = payout.teacherId;
            const currentTotal = currentPayMap.get(tid) || new client_1.Prisma.Decimal(0);
            currentPayMap.set(tid, currentTotal.plus(payout.teacherPayout));
            const ids = payoutIdsMap.get(tid) || [];
            ids.push(payout.id);
            payoutIdsMap.set(tid, ids);
        }
        const allTeacherIds = new Set([...currentPayMap.keys(), ...backPayMap.keys()]);
        for (const teacherId of allTeacherIds) {
            try {
                const checkStart = new Date(startDate);
                checkStart.setDate(checkStart.getDate() - 5);
                console.log(checkStart);
                const checkEnd = new Date(startDate);
                checkEnd.setDate(checkEnd.getDate() + 5);
                console.log(checkEnd);
                const exists = await this.prisma.payroll.findFirst({
                    where: { teacherId, periodStart: {
                            gte: checkStart,
                            lte: checkEnd
                        } },
                    include: { teacher: true },
                });
                if (exists) {
                    this.logger.debug(`Bảng lương ${exists.id} cho giáo viên ${exists.teacher.teacherCode} đã tồn tại. Bỏ qua...`);
                    success++;
                    continue;
                }
                const currentSalary = currentPayMap.get(teacherId) || new client_1.Prisma.Decimal(0);
                const backPayEntry = backPayMap.get(teacherId);
                const backPayAmount = backPayEntry?.amount || new client_1.Prisma.Decimal(0);
                const backPayDetails = backPayEntry?.details || [];
                const totalAmount = currentSalary.plus(backPayAmount);
                const totalSessions = payoutIdsMap.get(teacherId)?.length || 0;
                const metadata = {
                    totalSessions: totalSessions,
                    totalSessionPayouts: currentSalary.toFixed(0),
                    backPayCount: backPayDetails.length,
                    backPayTotal: backPayAmount.toFixed(0),
                    processedAt: new Date().toISOString(),
                    note: 'Lương Quỹ Lớp + Lương từ buổi học cũ',
                };
                const computedDetails = {
                    metadata,
                    backPayDetails: backPayDetails,
                };
                const payroll = await this.prisma.payroll.create({
                    data: {
                        teacherId,
                        periodStart: startDate,
                        periodEnd: displayPeriodEnd,
                        totalAmount: totalAmount,
                        backPayAmount: backPayAmount,
                        bonuses: 0,
                        computedDetails: computedDetails,
                        status: 'pending',
                    },
                });
                const idsToUpdate = payoutIdsMap.get(teacherId);
                if (idsToUpdate && idsToUpdate.length > 0) {
                    await this.prisma.teacherSessionPayout.updateMany({
                        where: { id: { in: idsToUpdate } },
                        data: { status: 'batched', payrollId: payroll.id },
                    });
                }
                success++;
                this.logger.log(`Đã tạo Payroll [${payroll.id}] cho GV ${teacherId}`);
            }
            catch (err) {
                failed++;
                const findTeacher = await this.prisma.teacher.findUnique({
                    where: { id: teacherId },
                });
                errors.push({
                    itemId: teacherId,
                    itemName: `Teacher Code ${findTeacher?.teacherCode || teacherId}`,
                    phase: 'Giai đoạn 3 (Tạo Payroll)',
                    error: err instanceof Error ? err.message : 'Lỗi không xác định',
                });
                this.logger.error(`Lỗi tạo Payroll cho GV ${teacherId}:`, err);
            }
        }
        return { success, failed, errors };
    }
};
exports.PayrollCronService = PayrollCronService;
__decorate([
    (0, schedule_1.Cron)('0 2 10 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollCronService.prototype, "handleGenerateTeacherPayroll", null);
exports.PayrollCronService = PayrollCronService = PayrollCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollCronService);
//# sourceMappingURL=payroll-teacherv2.service.js.map