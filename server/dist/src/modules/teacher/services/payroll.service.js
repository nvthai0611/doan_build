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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PayrollService = class PayrollService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeacherPayroll(params) {
        try {
            const { teacherId, month, status, page = 1, limit = 10 } = params;
            const where = {
                teacherId,
                status: { not: 'pending' },
            };
            if (status && status !== 'all') {
                where.status = status;
            }
            if (month && month.match(/^\d{4}-\d{2}$/)) {
                const [year, monthNum] = month.split('-');
                const startDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum) - 1, 1, 0, 0, 0, 0));
                const endDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999));
                where.adminPublishedAt = {
                    gte: startDate,
                    lte: endDate,
                };
                const payroll = await this.prisma.payroll.findFirst({
                    where,
                    include: {
                        payoutDetails: {
                            include: {
                                session: {
                                    include: {
                                        class: {
                                            select: {
                                                id: true,
                                                name: true,
                                                classCode: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        teacher: {
                            select: {
                                id: true,
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
                    orderBy: [{ adminPublishedAt: 'desc' }, { id: 'desc' }],
                });
                return {
                    data: payroll ? [payroll] : [],
                    pagination: {
                        currentPage: 1,
                        totalPages: payroll ? 1 : 0,
                        totalItems: payroll ? 1 : 0,
                        itemsPerPage: 1,
                    },
                    message: 'Lấy bảng lương thành công',
                };
            }
            const skip = (page - 1) * limit;
            const take = limit;
            const [payrolls, totalItems] = await this.prisma.$transaction([
                this.prisma.payroll.findMany({
                    where,
                    include: {
                        payoutDetails: {
                            include: {
                                session: {
                                    include: {
                                        class: {
                                            select: {
                                                id: true,
                                                name: true,
                                                classCode: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        teacher: {
                            select: {
                                id: true,
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
                    orderBy: [{ adminPublishedAt: 'desc' }, { id: 'desc' }],
                    skip,
                    take,
                }),
                this.prisma.payroll.count({ where }),
            ]);
            const totalPages = Math.ceil(totalItems / limit);
            if (payrolls.length === 0) {
                throw new common_1.HttpException('Không có dữ liệu bảng lương', 404);
            }
            return {
                data: payrolls,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                },
                message: 'Lấy danh sách lương thành công',
            };
        }
        catch (error) {
            console.error('Error getting teacher payroll:', error);
            throw error;
        }
    }
    async getPayrollDetail(params) {
        try {
            const { payrollId, classId, startDate, endDate, page, limit, } = params;
            const payroll = await this.prisma.payroll.findUnique({
                where: { id: BigInt(payrollId) },
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
            if (!payroll) {
                throw new Error('Payroll không tìm thấy');
            }
            const sessionWhere = {
                payrollId: BigInt(payrollId),
            };
            if (classId) {
                sessionWhere.session = {
                    classId,
                };
            }
            if (startDate || endDate) {
                sessionWhere.session = {
                    ...sessionWhere.session,
                    sessionDate: {},
                };
                if (startDate) {
                    sessionWhere.session.sessionDate.gte = new Date(startDate);
                }
                if (endDate) {
                    sessionWhere.session.sessionDate.lte = new Date(endDate);
                }
            }
            const totalSessions = await this.prisma.teacherSessionPayout.count({
                where: sessionWhere,
            });
            const skip = (page - 1) * limit;
            const sessions = await this.prisma.teacherSessionPayout.findMany({
                where: sessionWhere,
                include: {
                    session: {
                        include: {
                            class: {
                                select: {
                                    id: true,
                                    name: true,
                                    classCode: true,
                                },
                            },
                        },
                    },
                },
                orderBy: [{ session: { sessionDate: 'desc' } }],
                skip,
                take: limit,
            });
            const allSessions = await this.prisma.teacherSessionPayout.findMany({
                where: sessionWhere,
                select: {
                    teacherPayout: true,
                    session: {
                        select: {
                            substituteTeacherId: true,
                            teacherId: true,
                        },
                    },
                },
            });
            const summary = {
                totalSessions: allSessions.length,
                totalPayout: allSessions.reduce((sum, s) => sum + Number(s.teacherPayout), 0),
                regularSessions: allSessions.filter((s) => s.session.teacherId === payroll.teacherId &&
                    !s.session.substituteTeacherId).length,
                substituteSessions: allSessions.filter((s) => s.session.substituteTeacherId === payroll.teacherId).length,
            };
            const totalPages = Math.ceil(totalSessions / limit);
            return {
                payroll,
                sessions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalSessions,
                    itemsPerPage: limit,
                },
                summary,
                message: 'Lấy chi tiết lương thành công',
            };
        }
        catch (error) {
            console.error('Error getting payroll detail:', error);
            throw error;
        }
    }
    async approvePayroll(teacherId, payrollId) {
        try {
            const findTeacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: true
                }
            });
            const checkStatus = await this.prisma.payroll.findUnique({
                where: { teacherId: teacherId, id: BigInt(payrollId) },
            });
            if (!checkStatus) {
                throw new common_1.HttpException('Bảng lương không tồn tại', 404);
            }
            if (checkStatus?.status != 'waiting_teacher_approval') {
                throw new common_1.HttpException('Chỉ có thể duyệt bảng lương ở trạng thái chờ duyệt', 400);
            }
            const result = await this.prisma.payroll.update({
                where: { id: BigInt(payrollId) },
                data: { status: 'approved_by_teacher' },
            });
            await this.prisma.alert.create({
                data: {
                    alertType: 'payroll_approved',
                    title: `Giáo viên ${findTeacher?.user.fullName} đã duyệt bảng lương`,
                    message: `Giáo viên ${findTeacher?.user.fullName} đã duyệt bảng lương kỳ từ ${checkStatus?.periodStart.toLocaleDateString('vi-VN')} đến ${checkStatus?.periodEnd.toLocaleDateString('vi-VN')}.`,
                    isRead: false,
                    processed: false,
                }
            });
            return result;
        }
        catch (error) {
            console.error('Error approving payroll:', error);
            throw error;
        }
    }
    async rejectPayroll(teacherId, payrollId, rejectionReason) {
        try {
            const findTeacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: true
                }
            });
            const checkStatus = await this.prisma.payroll.findUnique({
                where: {
                    teacherId: teacherId,
                    id: BigInt(payrollId)
                },
            });
            if (!checkStatus) {
                throw new common_1.HttpException('Bảng lương không tồn tại', 404);
            }
            if (checkStatus.status !== 'waiting_teacher_approval') {
                throw new common_1.HttpException('Chỉ có thể từ chối bảng lương ở trạng thái chờ duyệt', 400);
            }
            if (!rejectionReason || rejectionReason.trim().length < 10) {
                throw new common_1.HttpException('Lý do từ chối phải có ít nhất 10 ký tự', 400);
            }
            const result = await this.prisma.payroll.update({
                where: { id: BigInt(payrollId) },
                data: {
                    status: 'rejected_by_teacher',
                    teacherRejectionReason: rejectionReason.trim(),
                    teacherActionAt: new Date()
                },
            });
            await this.prisma.alert.create({
                data: {
                    alertType: 'payroll_rejected',
                    processed: false,
                    message: `Giáo viên ${findTeacher?.user.fullName} đã khiếu nại bảng lương kỳ từ ${checkStatus?.periodStart.toLocaleDateString('vi-VN')} đến ${checkStatus?.periodEnd.toLocaleDateString('vi-VN')}. Lý do: ${rejectionReason.trim()}`,
                    isRead: false,
                    title: `Giáo viên ${findTeacher?.user.fullName} đã khiếu nại bảng lương`,
                }
            });
            return {
                data: result,
                message: 'Đã từ chối bảng lương thành công'
            };
        }
        catch (error) {
            console.error('Error rejecting payroll:', error);
            throw error;
        }
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map