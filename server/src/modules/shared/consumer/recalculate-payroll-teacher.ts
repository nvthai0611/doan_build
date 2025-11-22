import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../db/prisma.service';

@Processor('payroll-recalculation')
export class RecalculatedPayrollTeacherProcessor {
    private readonly logger = new Logger(RecalculatedPayrollTeacherProcessor.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Worker nhận lệnh tính lại lương
     */
    @Process('recalculate')
    async handleRecalculation(job: Job<{ payrollId: string }>) {
        const { payrollId } = job.data;
        this.logger.log(`🔄 Bắt đầu job tính lại Payroll ID: ${payrollId}`);

        try {
            const idBig = BigInt(payrollId);

            // 1. Kiểm tra Payroll hợp lệ
            const oldPayroll = await this.prisma.payroll.findUnique({
                where: { id: idBig },
                include: { teacher: true }
            });

            if (!oldPayroll) {
                this.logger.error(`Payroll ${payrollId} không tồn tại`);
                return;
            }

            // Chỉ tính lại nếu đang pending hoặc rejected
            if (!['pending', 'rejected_by_teacher'].includes(oldPayroll.status)) {
                this.logger.warn(`Payroll ${payrollId} trạng thái ${oldPayroll.status} không được phép tính lại.`);
                return;
            }

            const { teacherId, periodStart, periodEnd } = oldPayroll;

            // --- THIẾT LẬP THỜI GIAN ---
            const closingDate = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 7);
            closingDate.setHours(23, 59, 59, 999);

            const previousClosingDate = new Date(periodStart.getFullYear(), periodStart.getMonth(), 7);
            previousClosingDate.setHours(23, 59, 59, 999);

            const billingStart = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
            const billingEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 2, 0);

            // --- OPTIMIZATION: PRE-FETCH CONTRACTS ---
            const allContracts = await this.prisma.contractUpload.findMany({
                where: { teacherId, status: 'active' },
                orderBy: { uploadedAt: 'desc' },
                select: { startDate: true, expiredAt: true, teacherSalaryPercent: true }
            });

            const findRateInMemory = (date: Date): Prisma.Decimal => {
                const match = allContracts.find(c => {
                    const startOk = !c.startDate || c.startDate <= date;
                    const endOk = !c.expiredAt || c.expiredAt >= date;
                    return startOk && endOk;
                });
                if (!match || !match.teacherSalaryPercent) return new Prisma.Decimal(0);
                let rate = new Prisma.Decimal(match.teacherSalaryPercent);
                if (rate.gt(1)) rate = rate.dividedBy(100);
                return rate;
            };

            // === BẮT ĐẦU TRANSACTION ===
            await this.prisma.$transaction(async (tx) => {
                // A. XÓA DỮ LIỆU CŨ
                await tx.teacherSessionPayout.deleteMany({ where: { payrollId: idBig } });
                await tx.payroll.delete({ where: { id: idBig } });

                // B. TÍNH LƯƠNG THÁNG (POOL-BASED)
                const sessions = await tx.classSession.findMany({
                    where: {
                        sessionDate: { gte: periodStart, lte: periodEnd },
                        status: 'end',
                        OR: [{ teacherId }, { substituteTeacherId: teacherId }]
                    },
                    include: { class: { select: { id: true, feeAmount: true, feeStructure: { select: { amount: true } } } } }
                });

                let currentMonthSalary = new Prisma.Decimal(0);
                const newPayoutIds: bigint[] = [];

                // Group session theo lớp
                const sessionsByClass = new Map<string, typeof sessions>();
                for (const s of sessions) {
                    const list = sessionsByClass.get(s.classId) || [];
                    list.push(s);
                    sessionsByClass.set(s.classId, list);
                }

                for (const [classId, classSessions] of sessionsByClass) {
                    const cls = classSessions[0].class;
                    const realSessionFee = cls.feeAmount || cls.feeStructure?.amount || new Prisma.Decimal(0);

                    const feeRecords = await tx.feeRecord.findMany({
                        where: {
                            classId: classId,
                            dueDate: { gte: billingStart, lte: billingEnd },
                            status: 'paid',
                            feeRecordPayments: { some: { payment: { paidAt: { lte: closingDate } } } }
                        },
                        select: { totalAmount: true, amount: true }
                    });

                    const totalRevenue = feeRecords.reduce((sum, r) => sum.plus(r.totalAmount || r.amount), new Prisma.Decimal(0));
                    const totalClassSessions = await tx.classSession.count({
                        where: { classId, sessionDate: { gte: periodStart, lte: periodEnd }, status: 'end' }
                    });

                    if (totalRevenue.isZero() || totalClassSessions === 0) continue;
                    const rawValuePerSession = totalRevenue.dividedBy(totalClassSessions);

                    for (const session of classSessions) {
                        const newRate = findRateInMemory(session.sessionDate);
                        const teacherPayout = rawValuePerSession.times(newRate);

                        const attendanceCount = await tx.studentSessionAttendance.count({
                            where: { sessionId: session.id, status: { not: 'excused' } }
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
                                teacherPayout: teacherPayout
                            }
                        });
                        newPayoutIds.push(tsp.id);
                        currentMonthSalary = currentMonthSalary.plus(teacherPayout);
                    }
                }

                // C. TÍNH TRUY LĨNH (WINNER TAKES ALL)
                let backPayTotal = new Prisma.Decimal(0);
                const backPayDetails: any[] = [];

                const latePayments = await tx.feeRecordPayment.findMany({
                    where: {
                        payment: { paidAt: { gt: previousClosingDate, lte: closingDate } },
                        feeRecord: {
                            dueDate: { lt: billingStart },
                            status: 'paid',
                            class: { teacherId: teacherId }
                        },
                    },
                    include: { feeRecord: { include: { student: { include: { user: true } }, class: true } } }
                });

                for (const p of latePayments) {
                    const feeRecord = p.feeRecord;
                    if (!feeRecord) continue;

                    const paymentAmount = feeRecord.totalAmount || feeRecord.amount;
                    const newRate = findRateInMemory(feeRecord.dueDate);

                    if (newRate.isZero()) continue;

                    const payout = paymentAmount.times(newRate);
                    backPayTotal = backPayTotal.plus(payout);

                    backPayDetails.push({
                        feeRecordId: feeRecord.id,
                        sessionId: 'BACKPAY',
                        sessionDate: feeRecord.dueDate.toISOString().slice(0, 10),
                        description: `Truy lĩnh (Tính lại) - Lớp ${feeRecord.class?.name}`,
                        revenuePerSession: paymentAmount.toNumber(),
                        payoutRate: newRate.toNumber(),
                        payoutAmount: payout.toNumber()
                    });
                }

                // D. TẠO PAYROLL MỚI
                const totalAmount = currentMonthSalary.plus(backPayTotal);
                const metadata = {
                    totalSessions: newPayoutIds.length,
                    totalSessionPayouts: currentMonthSalary.toFixed(0),
                    backPayCount: backPayDetails.length,
                    backPayTotal: backPayTotal.toFixed(0),
                    processedAt: new Date().toISOString(),
                    note: 'Đã tính lại'
                };

                const newPayroll = await tx.payroll.create({
                    data: {
                        teacherId,
                        periodStart,
                        periodEnd,
                        totalAmount,
                        backPayAmount: backPayTotal,
                        bonuses: 0,
                        computedDetails: { metadata, backPayDetails } as any,
                        status: 'pending' // Reset về pending
                    }
                });

                if (newPayoutIds.length > 0) {
                    await tx.teacherSessionPayout.updateMany({
                        where: { id: { in: newPayoutIds } },
                        data: { payrollId: newPayroll.id }
                    });
                }
            });

            this.logger.log(`✅ Đã tính lại xong Payroll cho GV ${teacherId}`);

        } catch (error) {
            this.logger.error(`❌ Lỗi tính lại Payroll ${payrollId}:`, error);
            throw error; // Throw để BullMQ biết job fail và có thể retry
        }
    }
}