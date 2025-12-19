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
exports.FinancialReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
function getTimeBoundary(monthParam, yearParam) {
    const now = new Date();
    let year = now.getFullYear();
    let monthIndex = now.getMonth();
    if (yearParam) {
        const y = Number(yearParam);
        if (!isNaN(y)) {
            year = y;
        }
    }
    if (monthParam) {
        const m = Number(monthParam);
        if (!isNaN(m) && m >= 1 && m <= 12) {
            monthIndex = m - 1;
        }
    }
    else if (yearParam && !monthParam) {
        monthIndex = null;
    }
    if (monthIndex === null && yearParam) {
        const start = new Date(year, 0, 1, 0, 0, 0);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        return { start, end };
    }
    if (!monthParam && !yearParam) {
        return { start: undefined, end: undefined };
    }
    const start = new Date(year, monthIndex, 1, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
    return { start, end };
}
function getShiftedDueBoundary(monthParam, yearParam) {
    if (!monthParam) {
        return getTimeBoundary(monthParam, yearParam);
    }
    const now = new Date();
    let year = yearParam ? Number(yearParam) : now.getFullYear();
    const m = Number(monthParam);
    if (isNaN(m) || m < 1 || m > 12) {
        return getTimeBoundary(monthParam, yearParam);
    }
    const nextMonthIndex = m;
    const start = new Date(year, nextMonthIndex, 1, 0, 0, 0);
    const end = new Date(year, nextMonthIndex + 1, 0, 23, 59, 59, 999);
    return { start, end };
}
function toNumber(d) {
    if (!d)
        return 0;
    try {
        return d.toNumber ? d.toNumber() : Number(d);
    }
    catch {
        return Number(d);
    }
}
let FinancialReportsService = class FinancialReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveAmount(agg) {
        const totalAmount = toNumber(agg._sum?.totalAmount);
        if (totalAmount)
            return totalAmount;
        const amount = toNumber(agg._sum?.amount);
        const scholarship = toNumber(agg._sum?.scholarship);
        return amount - scholarship;
    }
    async buildMonthlyTrend(months) {
        const now = new Date();
        const items = [];
        const oldestDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
        const newestDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
        const [allFeeRecords, allPayrolls, enrollments] = await Promise.all([
            this.prisma.feeRecord.findMany({
                where: {
                    status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                    dueDate: { gte: oldestDate, lte: newestDate }
                },
                select: {
                    status: true,
                    totalAmount: true,
                    dueDate: true,
                    classId: true,
                    studentId: true
                }
            }),
            this.prisma.payroll.findMany({
                where: {
                    status: 'paid',
                    periodStart: { gte: oldestDate, lte: newestDate }
                },
                select: {
                    totalAmount: true,
                    periodStart: true
                }
            }),
            this.prisma.enrollment.findMany({
                where: { status: 'studying' },
                select: {
                    classId: true,
                    studentId: true
                }
            })
        ]);
        const enrollmentSet = new Set(enrollments.map(e => `${e.studentId}-${e.classId}`));
        const feeRecordsByKey = new Map();
        allFeeRecords.forEach(fr => {
            if (!fr.classId || !fr.studentId)
                return;
            const yearMonth = `${fr.dueDate.getFullYear()}-${fr.dueDate.getMonth()}`;
            const key = `${yearMonth}-${fr.studentId}-${fr.classId}`;
            if (!feeRecordsByKey.has(key)) {
                feeRecordsByKey.set(key, []);
            }
            feeRecordsByKey.get(key).push(fr);
        });
        const payrollsByMonth = new Map();
        allPayrolls.forEach(p => {
            const yearMonth = `${p.periodStart.getFullYear()}-${p.periodStart.getMonth()}`;
            payrollsByMonth.set(yearMonth, (payrollsByMonth.get(yearMonth) || 0) + toNumber(p.totalAmount));
        });
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = `T${d.getMonth() + 1}`;
            const monthNumber = d.getMonth() + 1;
            const yearNumber = d.getFullYear();
            const nextMonth = (monthNumber % 12) + 1;
            const nextYear = nextMonth === 1 ? yearNumber + 1 : yearNumber;
            const shiftedYearMonth = `${nextYear}-${nextMonth - 1}`;
            let monthRevenue = 0;
            const processedStudents = new Set();
            enrollments.forEach(enrollment => {
                const studentClassKey = `${enrollment.studentId}-${enrollment.classId}`;
                if (!enrollmentSet.has(studentClassKey))
                    return;
                const uniqueKey = `${shiftedYearMonth}-${studentClassKey}`;
                if (processedStudents.has(uniqueKey))
                    return;
                processedStudents.add(uniqueKey);
                const feeRecords = feeRecordsByKey.get(`${shiftedYearMonth}-${studentClassKey}`) || [];
                if (feeRecords.length === 0)
                    return;
                const paidAmount = feeRecords
                    .filter(fr => fr.status === 'paid')
                    .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0);
                const hasPending = feeRecords.some(fr => ['pending', 'processing'].includes(fr.status));
                const hasOverdue = feeRecords.some(fr => fr.status === 'overdue');
                const enrollmentStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : paidAmount > 0 ? 'paid' : 'unrecorded';
                if (enrollmentStatus === 'paid') {
                    monthRevenue += paidAmount;
                }
            });
            const salaryYearMonth = `${yearNumber}-${monthNumber - 1}`;
            const monthSalary = payrollsByMonth.get(salaryYearMonth) || 0;
            items.push({
                label: monthLabel,
                revenue: monthRevenue,
                salary: monthSalary
            });
        }
        return items;
    }
    async buildYearlyTrend(years, selectedYear) {
        const now = new Date();
        const endYear = selectedYear || now.getFullYear();
        const startYear = endYear - (years - 1);
        const items = [];
        const oldestDate = new Date(startYear, 1, 1, 0, 0, 0);
        const newestDate = new Date(endYear + 1, 1, 0, 23, 59, 59, 999);
        const [allFeeRecords, allPayrolls, enrollments] = await Promise.all([
            this.prisma.feeRecord.findMany({
                where: {
                    status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                    dueDate: { gte: oldestDate, lte: newestDate }
                },
                select: {
                    status: true,
                    totalAmount: true,
                    dueDate: true,
                    classId: true,
                    studentId: true
                }
            }),
            this.prisma.payroll.findMany({
                where: {
                    status: 'paid',
                    periodStart: { gte: new Date(startYear, 0, 1), lte: new Date(endYear, 11, 31, 23, 59, 59, 999) }
                },
                select: {
                    totalAmount: true,
                    periodStart: true
                }
            }),
            this.prisma.enrollment.findMany({
                where: { status: 'studying' },
                select: {
                    classId: true,
                    studentId: true
                }
            })
        ]);
        const enrollmentSet = new Set(enrollments.map(e => `${e.studentId}-${e.classId}`));
        const feeRecordsByKey = new Map();
        allFeeRecords.forEach(fr => {
            if (!fr.classId || !fr.studentId)
                return;
            const yearMonth = `${fr.dueDate.getFullYear()}-${fr.dueDate.getMonth()}`;
            const key = `${yearMonth}-${fr.studentId}-${fr.classId}`;
            if (!feeRecordsByKey.has(key)) {
                feeRecordsByKey.set(key, []);
            }
            feeRecordsByKey.get(key).push(fr);
        });
        const payrollsByMonth = new Map();
        allPayrolls.forEach(p => {
            const yearMonth = `${p.periodStart.getFullYear()}-${p.periodStart.getMonth()}`;
            payrollsByMonth.set(yearMonth, (payrollsByMonth.get(yearMonth) || 0) + toNumber(p.totalAmount));
        });
        for (let y = startYear; y <= endYear; y++) {
            let yearRevenue = 0;
            let yearSalary = 0;
            for (let month = 1; month <= 12; month++) {
                const nextMonth = (month % 12) + 1;
                const nextYear = nextMonth === 1 ? y + 1 : y;
                const shiftedYearMonth = `${nextYear}-${nextMonth - 1}`;
                const processedStudents = new Set();
                enrollments.forEach(enrollment => {
                    const studentClassKey = `${enrollment.studentId}-${enrollment.classId}`;
                    if (!enrollmentSet.has(studentClassKey))
                        return;
                    const uniqueKey = `${shiftedYearMonth}-${studentClassKey}`;
                    if (processedStudents.has(uniqueKey))
                        return;
                    processedStudents.add(uniqueKey);
                    const feeRecords = feeRecordsByKey.get(`${shiftedYearMonth}-${studentClassKey}`) || [];
                    if (feeRecords.length === 0)
                        return;
                    const paidAmount = feeRecords
                        .filter(fr => fr.status === 'paid')
                        .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0);
                    const hasPending = feeRecords.some(fr => ['pending', 'processing'].includes(fr.status));
                    const hasOverdue = feeRecords.some(fr => fr.status === 'overdue');
                    const enrollmentStatus = hasOverdue ? 'overdue' : hasPending ? 'pending' : paidAmount > 0 ? 'paid' : 'unrecorded';
                    if (enrollmentStatus === 'paid') {
                        yearRevenue += paidAmount;
                    }
                });
                const salaryYearMonth = `${y}-${month - 1}`;
                yearSalary += payrollsByMonth.get(salaryYearMonth) || 0;
            }
            items.push({
                label: String(y),
                revenue: yearRevenue,
                salary: yearSalary
            });
        }
        return items;
    }
    async getSummary(month, year) {
        const { start, end } = getTimeBoundary(month, year);
        const { start: dueStart, end: dueEnd } = getShiftedDueBoundary(month, year);
        let prevPayrollStart;
        let prevPayrollEnd;
        if (month && year) {
            let pm = Number(month) - 1;
            let py = Number(year);
            if (pm <= 0) {
                pm = 12;
                py = py - 1;
            }
            const prevBoundary = getTimeBoundary(String(pm), String(py));
            prevPayrollStart = prevBoundary.start;
            prevPayrollEnd = prevBoundary.end;
        }
        let prevStart;
        let prevEnd;
        if (month && year) {
            let pm = Number(month) - 1;
            let py = Number(year);
            if (pm <= 0) {
                pm = 12;
                py = py - 1;
            }
            const prevDue = getShiftedDueBoundary(String(pm), String(py));
            prevStart = prevDue.start;
            prevEnd = prevDue.end;
        }
        const [paidAgg, monthPaidAgg, prevMonthPaidAgg, prevMonthPayrollAgg, pendingAgg, overdueAgg, outstandingStudentsCount, classRevenueRaw, prevMonthClassRevenueRaw, payrolls, monthlyTrend, yearlyTrend, studentsTotalCount] = await Promise.all([
            this.prisma.feeRecord.aggregate({
                _sum: { amount: true, scholarship: true, totalAmount: true },
                where: { status: 'paid' }
            }),
            this.prisma.feeRecord.aggregate({
                _sum: { amount: true, scholarship: true, totalAmount: true },
                where: { status: 'paid', dueDate: { gte: dueStart, lte: dueEnd } }
            }),
            prevStart && prevEnd ? this.prisma.feeRecord.aggregate({
                _sum: { amount: true, scholarship: true, totalAmount: true },
                where: { status: 'paid', dueDate: { gte: prevStart, lte: prevEnd } }
            }) : Promise.resolve({ _sum: { totalAmount: null } }),
            prevPayrollStart && prevPayrollEnd ? this.prisma.payroll.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'paid', periodStart: { gte: prevPayrollStart, lte: prevPayrollEnd } }
            }) : Promise.resolve({ _sum: { totalAmount: null } }),
            this.prisma.feeRecord.aggregate({
                _sum: { amount: true, scholarship: true, totalAmount: true },
                where: { status: { in: ['pending', 'processing'] }, dueDate: { gte: dueStart, lte: dueEnd } }
            }),
            this.prisma.feeRecord.aggregate({
                _sum: { amount: true, scholarship: true, totalAmount: true },
                where: { status: 'overdue', dueDate: { gte: dueStart, lte: dueEnd } }
            }),
            this.prisma.feeRecord.count({
                where: { status: 'overdue', dueDate: { gte: dueStart, lte: dueEnd } }
            }),
            this.prisma.feeRecord.groupBy({
                by: ['classId'],
                where: {
                    status: 'paid',
                    dueDate: { gte: dueStart, lte: dueEnd },
                    classId: { not: null }
                },
                _sum: { amount: true, scholarship: true, totalAmount: true },
                _count: { id: true }
            }),
            prevStart && prevEnd ? this.prisma.feeRecord.groupBy({
                by: ['classId'],
                where: {
                    status: 'paid',
                    dueDate: { gte: prevStart, lte: prevEnd },
                    classId: { not: null }
                },
                _sum: { amount: true, scholarship: true, totalAmount: true },
                _count: { id: true }
            }) : Promise.resolve([]),
            this.prisma.payroll.findMany({
                where: start && end ? {
                    periodStart: { gte: start, lte: end }
                } : {},
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                    periodStart: true,
                    periodEnd: true,
                    teacherId: true,
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { periodStart: 'desc' }
            }),
            this.buildMonthlyTrend(12),
            this.buildYearlyTrend(5, year ? Number(year) : undefined),
            this.prisma.student.count()
        ]);
        const totalPaid = this.resolveAmount(paidAgg);
        const monthCollected = this.resolveAmount(monthPaidAgg);
        const prevMonthRevenue = this.resolveAmount(prevMonthPaidAgg);
        const prevMonthSalary = toNumber(prevMonthPayrollAgg._sum?.totalAmount);
        const pendingAmount = this.resolveAmount(pendingAgg);
        const overdueAmount = this.resolveAmount(overdueAgg);
        const revenueChangePercent = prevMonthRevenue > 0 ? Math.round(((monthCollected - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
        const periodPaid = monthCollected;
        const tuitionTotal = periodPaid + pendingAmount + overdueAmount;
        const tuitionBreakdownPercent = (() => {
            if (tuitionTotal <= 0)
                return { paid: 0, pending: 0, overdue: 0 };
            const paid = Math.round((periodPaid / tuitionTotal) * 100);
            const pending = Math.round((pendingAmount / tuitionTotal) * 100);
            const overdue = Math.max(0, 100 - paid - pending);
            return { paid, pending, overdue };
        })();
        const sortedClassRevenue = classRevenueRaw
            .map(r => ({
            classId: r.classId,
            revenueAmount: this.resolveAmount(r),
            feeRecordCount: r._count.id
        }))
            .sort((a, b) => b.revenueAmount - a.revenueAmount);
        const classIds = sortedClassRevenue.map(c => c.classId);
        const [classes, studentCounts] = await Promise.all([
            classIds.length ? this.prisma.class.findMany({
                where: { id: { in: classIds } },
                select: {
                    id: true,
                    name: true,
                    subject: { select: { name: true } }
                }
            }) : Promise.resolve([]),
            classIds.length ? Promise.all(classIds.map(classId => this.prisma.feeRecord.findMany({
                where: {
                    classId,
                    status: 'paid',
                    dueDate: { gte: start, lte: end }
                },
                select: { studentId: true },
                distinct: ['studentId']
            }).then(records => ({ classId, count: records.length })))) : Promise.resolve([])
        ]);
        const classMap = new Map(classes.map(c => [c.id, c]));
        const studentCountMap = new Map(studentCounts.map(sc => [sc.classId, sc.count]));
        const classTopRevenue = sortedClassRevenue.map(c => ({
            classId: c.classId,
            className: classMap.get(c.classId)?.name || 'Lớp chưa xác định',
            subjectName: classMap.get(c.classId)?.subject?.name,
            revenueAmount: c.revenueAmount,
            studentCount: studentCountMap.get(c.classId) || 0
        }));
        const totalClassRevenue = classTopRevenue.reduce((acc, c) => acc + c.revenueAmount, 0);
        const prevMonthClassRevenueTotal = (prevMonthClassRevenueRaw || [])
            .reduce((acc, r) => acc + this.resolveAmount(r), 0);
        const teacherSalaries = payrolls.map(p => ({
            id: p.id,
            teacherId: p.teacher.id,
            teacherName: p.teacher.user.fullName || 'Chưa cập nhật',
            email: p.teacher.user.email,
            salary: toNumber(p.totalAmount),
            status: p.status,
            periodStart: p.periodStart.toISOString(),
            periodEnd: p.periodEnd.toISOString()
        }));
        const payrollPaidAmount = teacherSalaries
            .filter(t => t.status === 'paid')
            .reduce((acc, t) => acc + t.salary, 0);
        const payrollPendingAmount = teacherSalaries
            .filter(t => ['pending', 'waiting_teacher_approval', 'approved_by_teacher'].includes(t.status))
            .reduce((acc, t) => acc + t.salary, 0);
        const teacherCountPaid = teacherSalaries.filter(t => t.status === 'paid').length;
        const teacherCountPending = teacherSalaries.filter(t => ['pending', 'waiting_teacher_approval', 'approved_by_teacher'].includes(t.status)).length;
        const currentProfit = payrollPaidAmount > 0 ? monthCollected - payrollPaidAmount : monthCollected;
        const prevMonthProfit = prevMonthRevenue - prevMonthSalary;
        const profitChangePercent = prevMonthProfit > 0 ? Math.round(((currentProfit - prevMonthProfit) / prevMonthProfit) * 100) : 0;
        let yearlyRevenueChangePercent = 0;
        let yearlyProfitChangePercent = 0;
        let selectedYearRevenue = 0;
        let selectedYearSalary = 0;
        if (yearlyTrend && yearlyTrend.length >= 2) {
            const currentYearData = yearlyTrend[yearlyTrend.length - 1];
            const previousYearData = yearlyTrend[yearlyTrend.length - 2];
            selectedYearRevenue = currentYearData.revenue;
            selectedYearSalary = currentYearData.salary;
            if (previousYearData.revenue > 0) {
                yearlyRevenueChangePercent = Math.round(((currentYearData.revenue - previousYearData.revenue) / previousYearData.revenue) * 100);
            }
            const currentYearProfit = currentYearData.revenue - currentYearData.salary;
            const previousYearProfit = previousYearData.revenue - previousYearData.salary;
            if (previousYearProfit > 0) {
                yearlyProfitChangePercent = Math.round(((currentYearProfit - previousYearProfit) / previousYearProfit) * 100);
            }
        }
        else if (yearlyTrend && yearlyTrend.length === 1) {
            selectedYearRevenue = yearlyTrend[0].revenue;
            selectedYearSalary = yearlyTrend[0].salary;
        }
        return {
            revenue: {
                totalPaid,
                monthCollected,
                prevMonthRevenue,
                monthlyTrend,
                yearlyTrend,
                revenueChangePercent,
                yearlyRevenueChangePercent,
                yearlyRevenue: selectedYearRevenue,
                classRevenue: totalClassRevenue,
                prevMonthClassRevenue: prevMonthClassRevenueTotal
            },
            tuition: {
                paidAmount: totalPaid,
                pendingAmount,
                overdueAmount,
                breakdownPercent: tuitionBreakdownPercent,
                outstandingStudentsCount
            },
            classes: {
                topRevenue: classTopRevenue,
                totalClassRevenue
            },
            payroll: {
                paidAmount: payrollPaidAmount,
                pendingAmount: payrollPendingAmount,
                teacherCountPaid,
                teacherCountPending,
                teacherSalaries,
                profitChangePercent,
                yearlyProfitChangePercent,
                yearlySalary: selectedYearSalary
            },
            students: {
                totalCount: studentsTotalCount
            },
            generatedAt: new Date().toISOString()
        };
    }
    async getOutstandingStudents(month, year) {
        const { start, end } = getShiftedDueBoundary(month, year);
        const outstandingRecords = await this.prisma.feeRecord.findMany({
            where: {
                status: { in: ['pending', 'processing', 'overdue'] },
                dueDate: { gte: start, lte: end }
            },
            include: {
                student: {
                    include: {
                        user: true,
                        enrollments: {
                            include: {
                                class: true
                            },
                            where: {
                                status: 'studying'
                            },
                            orderBy: {
                                enrolledAt: 'desc'
                            }
                        }
                    }
                }
            },
            orderBy: [
                { status: 'desc' },
                { dueDate: 'asc' }
            ]
        });
        const groupedByStudent = new Map();
        outstandingRecords.forEach(record => {
            const key = record.studentId;
            const amount = this.resolveAmount({ _sum: { totalAmount: record.totalAmount } });
            if (!groupedByStudent.has(key)) {
                const classes = (record.student?.enrollments || [])
                    .map(e => e.class?.name)
                    .filter(Boolean);
                groupedByStudent.set(key, {
                    studentId: record.studentId,
                    studentName: record.student?.user?.fullName || 'N/A',
                    classes,
                    totalAmount: 0,
                    records: []
                });
            }
            const group = groupedByStudent.get(key);
            group.totalAmount += amount;
            const classNameFromEnrollments = (record.student?.enrollments || [])
                .map(e => e.class?.name)
                .filter(Boolean)[0] || null;
            group.records.push({
                feeRecordId: record.id,
                amount,
                dueDate: record.dueDate,
                status: record.status,
                createdAt: record.createdAt,
                className: classNameFromEnrollments
            });
        });
        return Array.from(groupedByStudent.values())
            .sort((a, b) => b.totalAmount - a.totalAmount);
    }
    async getStudentsByStatus(statuses, month, year) {
        const { start, end } = getShiftedDueBoundary(month, year);
        const records = await this.prisma.feeRecord.findMany({
            where: {
                status: { in: statuses },
                dueDate: { gte: start, lte: end }
            },
            include: {
                student: {
                    include: {
                        user: true,
                        enrollments: {
                            include: {
                                class: true
                            },
                            where: {
                                status: 'studying'
                            },
                            orderBy: {
                                enrolledAt: 'desc'
                            }
                        }
                    }
                }
            },
            orderBy: [
                { dueDate: 'asc' }
            ]
        });
        const groupedByStudent = new Map();
        records.forEach(record => {
            const key = record.studentId;
            const amount = this.resolveAmount({ _sum: { totalAmount: record.totalAmount } });
            if (!groupedByStudent.has(key)) {
                const classes = (record.student?.enrollments || [])
                    .map(e => e.class?.name)
                    .filter(Boolean);
                groupedByStudent.set(key, {
                    studentId: record.studentId,
                    studentName: record.student?.user?.fullName || 'N/A',
                    classes,
                    totalAmount: 0,
                    records: []
                });
            }
            const group = groupedByStudent.get(key);
            group.totalAmount += amount;
            const classNameFromEnrollments = (record.student?.enrollments || [])
                .map(e => e.class?.name)
                .filter(Boolean)[0] || null;
            group.records.push({
                feeRecordId: record.id,
                amount,
                dueDate: record.dueDate,
                status: record.status,
                createdAt: record.createdAt,
                className: classNameFromEnrollments
            });
        });
        return Array.from(groupedByStudent.values())
            .sort((a, b) => b.totalAmount - a.totalAmount);
    }
    async getOverdueStudents(month, year) {
        return this.getStudentsByStatus(['overdue'], month, year);
    }
    async getPendingStudents(month, year) {
        return this.getStudentsByStatus(['pending', 'processing'], month, year);
    }
    async getClassStudentsStatus(month, year) {
        const { start, end } = getShiftedDueBoundary(month, year);
        const [enrollments, feeRecords, classes] = await Promise.all([
            this.prisma.enrollment.findMany({
                where: { status: 'studying' },
                select: {
                    classId: true,
                    studentId: true,
                    student: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.feeRecord.findMany({
                where: {
                    status: { in: ['paid', 'pending', 'processing', 'overdue'] },
                    dueDate: { gte: start, lte: end }
                },
                select: {
                    id: true,
                    status: true,
                    totalAmount: true,
                    classId: true,
                    studentId: true
                }
            }),
            this.prisma.class.findMany({
                select: {
                    id: true,
                    name: true,
                    subject: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ]);
        const classMap = new Map(classes.map(c => [c.id, c]));
        const feeRecordsByStudentClass = new Map();
        feeRecords.forEach(fr => {
            if (!fr.classId || !fr.studentId)
                return;
            const key = `${fr.studentId}-${fr.classId}`;
            if (!feeRecordsByStudentClass.has(key)) {
                feeRecordsByStudentClass.set(key, []);
            }
            feeRecordsByStudentClass.get(key).push(fr);
        });
        const classDataMap = new Map();
        enrollments.forEach(enrollment => {
            const classId = enrollment.classId;
            const key = `${enrollment.studentId}-${classId}`;
            const feeRecordsForEnrollment = feeRecordsByStudentClass.get(key) || [];
            const paidAmount = feeRecordsForEnrollment
                .filter(fr => fr.status === 'paid')
                .reduce((sum, fr) => sum + toNumber(fr.totalAmount), 0);
            const hasPending = feeRecordsForEnrollment.some(fr => ['pending', 'processing'].includes(fr.status));
            const hasOverdue = feeRecordsForEnrollment.some(fr => fr.status === 'overdue');
            const enrollmentStatus = hasOverdue
                ? 'overdue'
                : hasPending
                    ? 'pending'
                    : paidAmount > 0
                        ? 'paid'
                        : 'unrecorded';
            if (!classDataMap.has(classId)) {
                const classInfo = classMap.get(classId);
                classDataMap.set(classId, {
                    classId,
                    className: classInfo?.name || 'Lớp chưa xác định',
                    subjectName: classInfo?.subject?.name,
                    totalStudents: 0,
                    paidStudents: 0,
                    unpaidStudents: 0,
                    pendingStudents: 0,
                    overdueStudents: 0,
                    unpaidStudentsList: [],
                    totalRevenueAmount: 0
                });
            }
            const classData = classDataMap.get(classId);
            classData.totalStudents += 1;
            if (enrollmentStatus === 'paid') {
                classData.paidStudents += 1;
                classData.totalRevenueAmount += paidAmount;
            }
            if (enrollmentStatus === 'pending') {
                classData.unpaidStudents += 1;
                classData.pendingStudents += 1;
                classData.unpaidStudentsList.push({
                    studentId: enrollment.student.id,
                    studentName: enrollment.student.user.fullName || 'Chưa cập nhật',
                    email: enrollment.student.user.email
                });
            }
            if (enrollmentStatus === 'overdue') {
                classData.unpaidStudents += 1;
                classData.overdueStudents += 1;
                classData.unpaidStudentsList.push({
                    studentId: enrollment.student.id,
                    studentName: enrollment.student.user.fullName || 'Chưa cập nhật',
                    email: enrollment.student.user.email
                });
            }
        });
        return Array.from(classDataMap.values())
            .sort((a, b) => {
            if ((b.unpaidStudents > 0) !== (a.unpaidStudents > 0)) {
                return (b.unpaidStudents > 0 ? 1 : 0) - (a.unpaidStudents > 0 ? 1 : 0);
            }
            if (a.unpaidStudents !== b.unpaidStudents) {
                return b.unpaidStudents - a.unpaidStudents;
            }
            return b.totalRevenueAmount - a.totalRevenueAmount;
        });
    }
};
exports.FinancialReportsService = FinancialReportsService;
exports.FinancialReportsService = FinancialReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialReportsService);
//# sourceMappingURL=financial-reports.service.js.map