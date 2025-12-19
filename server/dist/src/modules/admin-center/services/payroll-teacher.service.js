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
exports.PayRollTeacherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PayRollTeacherService = class PayRollTeacherService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListTeachers(teacherName, email, status, month) {
        const whereClause = {
            user: {
                isActive: true,
                ...(teacherName && {
                    fullName: {
                        contains: teacherName,
                        mode: 'insensitive'
                    }
                }),
                ...(email && {
                    email: {
                        contains: email,
                        mode: 'insensitive'
                    }
                })
            }
        };
        const getPreviousMonthString = () => {
            const now = new Date();
            const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1);
            const y = lastOfPrevMonth.getFullYear();
            const m = String(lastOfPrevMonth.getMonth() + 1).padStart(2, '0');
            return `${y}-${m}`;
        };
        const getMonthRange = (monthString) => {
            const ms = monthString && monthString.includes('-') ? monthString : getPreviousMonthString();
            const [year, monthNum] = ms.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
            return { startDate, endDate };
        };
        const effectiveMonth = month && month.trim() !== '' ? month : getPreviousMonthString();
        const payrollFilter = {};
        if (status) {
            payrollFilter.status = status;
        }
        if (effectiveMonth) {
            const monthRange = getMonthRange(effectiveMonth);
            payrollFilter.AND = [
                {
                    periodStart: {
                        gte: monthRange.startDate
                    }
                },
                {
                    periodStart: {
                        lt: monthRange.endDate
                    }
                }
            ];
        }
        const teachers = await this.prisma.teacher.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                payrolls: {
                    ...(Object.keys(payrollFilter).length > 0 && {
                        where: payrollFilter
                    }),
                    orderBy: {
                        periodStart: 'desc'
                    }
                },
                payrollPayments: true
            }
        });
        const mapped = teachers.map((t) => ({
            ...t,
            payrolls: Array.isArray(t.payrolls) && t.payrolls.length > 0 ? t.payrolls : null
        }));
        return mapped;
    }
    async getAllPayrollsByTeacherId(teacherId, year, classId) {
        try {
            const whereClause = {
                teacherId: teacherId
            };
            if (year) {
                const startDate = new Date(parseInt(year), 0, 1);
                const endDate = new Date(parseInt(year) + 1, 0, 1);
                whereClause.AND = [
                    { periodStart: { gte: startDate } },
                    { periodStart: { lt: endDate } },
                ];
            }
            if (classId) {
                whereClause.payoutDetails = {
                    some: {
                        session: {
                            classId: classId
                        }
                    }
                };
            }
            const payrolls = await this.prisma.payroll.findMany({
                where: whereClause,
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    payrollPayment: true
                },
                orderBy: {
                    periodStart: 'desc'
                }
            });
            return { data: payrolls, message: 'Payrolls retrieved successfully' };
        }
        catch (error) {
            console.error('Error retrieving payrolls:', error);
            throw new Error('Failed to retrieve payrolls');
        }
    }
    async getDetailPayrollTeacher(teacherId, month, classId) {
        try {
            const whereClause = {
                teacherId: teacherId,
                ...(classId && { classId: classId }),
            };
            if (month) {
                const [year, monthNum] = month.split('-');
                const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
                whereClause.periodStart = {
                    gte: startDate,
                    lt: endDate,
                };
            }
            const payrolls = await this.prisma.payroll.findMany({
                where: whereClause,
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    payoutDetails: {
                        include: {
                            session: {
                                include: {
                                    class: {
                                        select: {
                                            id: true,
                                            name: true,
                                            classCode: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    periodStart: 'desc',
                },
            });
            return { data: payrolls, message: 'Payrolls retrieved successfully' };
        }
        catch (error) {
            console.error('Error retrieving teacher payroll:', error);
            throw new Error('Failed to retrieve payrolls');
        }
    }
    async getPayrollById(payrollId) {
        try {
            const idBig = BigInt(payrollId);
            const payroll = await this.prisma.payroll.findUnique({
                where: { id: idBig },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: { id: true, fullName: true, email: true }
                            }
                        }
                    },
                    payrollPayment: true,
                    payoutDetails: {
                        include: {
                            session: {
                                select: {
                                    id: true,
                                    sessionDate: true,
                                    startTime: true,
                                    endTime: true,
                                    status: true,
                                    notes: true,
                                    class: {
                                        select: { id: true, name: true, classCode: true }
                                    },
                                    teacher: {
                                        select: {
                                            id: true,
                                            user: { select: { id: true, fullName: true, email: true } }
                                        }
                                    },
                                    substituteTeacher: {
                                        select: {
                                            id: true,
                                            user: { select: { id: true, fullName: true, email: true } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return { data: payroll, message: 'Payroll detail retrieved successfully' };
        }
        catch (error) {
            console.error('Error retrieving payroll detail:', error);
            throw new Error('Failed to retrieve payroll detail');
        }
    }
    async getClassSessionsByClassId(classId, month, teacherId) {
        try {
            const where = { classId };
            if (month && month.includes('-')) {
                const [year, monthNum] = month.split('-');
                const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
                where.sessionDate = {
                    gte: startDate,
                    lt: endDate
                };
            }
            if (teacherId) {
                where.OR = [
                    { teacherId: teacherId },
                    { substituteTeacherId: teacherId }
                ];
            }
            const sessions = await this.prisma.classSession.findMany({
                where,
                include: {
                    class: { select: { id: true, name: true, classCode: true } },
                    teacher: {
                        select: {
                            id: true,
                            user: { select: { id: true, fullName: true, email: true } }
                        }
                    },
                    substituteTeacher: {
                        select: {
                            id: true,
                            user: { select: { id: true, fullName: true, email: true } }
                        }
                    },
                    teacherSessionPayout: {
                        select: {
                            id: true,
                            studentCount: true,
                            sessionFeePerStudent: true,
                            totalRevenue: true,
                            payoutRate: true,
                            teacherPayout: true,
                            status: true,
                            calculatedAt: true
                        }
                    }
                },
                orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }]
            });
            return { data: sessions, message: 'Class sessions retrieved successfully' };
        }
        catch (error) {
            console.error('Error retrieving class sessions by classId:', error);
            throw new Error('Failed to retrieve class sessions');
        }
    }
};
exports.PayRollTeacherService = PayRollTeacherService;
exports.PayRollTeacherService = PayRollTeacherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayRollTeacherService);
//# sourceMappingURL=payroll-teacher.service.js.map