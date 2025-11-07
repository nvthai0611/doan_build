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
        const getMonthRange = (monthString) => {
            const [year, monthNum] = monthString.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
            return { startDate, endDate };
        };
        const payrollFilter = {};
        if (status) {
            payrollFilter.status = status;
        }
        if (month) {
            const monthRange = getMonthRange(month);
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
        if (Object.keys(payrollFilter).length > 0) {
            whereClause.payrolls = {
                some: payrollFilter
            };
        }
        return this.prisma.teacher.findMany({
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
    }
    async getTeacherPayroll() {
    }
};
exports.PayRollTeacherService = PayRollTeacherService;
exports.PayRollTeacherService = PayRollTeacherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayRollTeacherService);
//# sourceMappingURL=payroll-teacher.service.js.map