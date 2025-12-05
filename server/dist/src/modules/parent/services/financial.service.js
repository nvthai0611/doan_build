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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let FinancialService = class FinancialService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllFeeRecordsForParent(parentId, status) {
        try {
            if (!(0, validate_util_1.checkId)(parentId)) {
                throw new common_1.HttpException({
                    message: 'ID phụ huynh không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const getStudents = await this.prisma.student.findMany({
                where: { parentId: parentId },
            });
            if (getStudents.length === 0) {
                throw new common_1.HttpException({
                    message: 'Không tìm thấy học sinh nào cho phụ huynh này',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const studentIds = getStudents.map(student => student.id);
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: {
                    studentId: { in: studentIds },
                    status: status ? status : undefined
                },
                include: {
                    class: {
                        include: {
                            sessions: {
                                where: {
                                    status: 'completed'
                                }
                            }
                        }
                    },
                    feeStructure: true,
                    student: {
                        include: {
                            school: true,
                            user: {
                                select: {
                                    fullName: true,
                                }
                            },
                            attendances: {
                                where: {
                                    status: {
                                        not: 'excused'
                                    },
                                    session: {
                                        status: 'completed'
                                    }
                                },
                                include: {
                                    session: true
                                }
                            }
                        }
                    }
                }
            });
            if (feeRecords.length === 0) {
                throw new common_1.HttpException({
                    message: 'Không tìm thấy hồ sơ phí nào cho phụ huynh này',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const feeRecordsWithAttendanceCount = feeRecords.map(record => ({
                ...record,
                student: {
                    ...record.student,
                    attendedSessionsCount: record.student.attendances.length
                }
            }));
            return feeRecordsWithAttendanceCount;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                message: 'Lỗi khi lấy danh sách nộp học phí',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentForParentByStatus(parentId, status) {
        try {
            if (!(0, validate_util_1.checkId)(parentId)) {
                throw new common_1.HttpException({ message: 'ID phụ huynh không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const payments = await this.prisma.payment.findMany({
                where: {
                    parentId,
                    status: status === 'pending'
                        ? { in: ['pending', 'partially_paid'] }
                        : (status ? status : undefined)
                },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    class: {
                                        select: {
                                            name: true,
                                            classCode: true,
                                        }
                                    },
                                    feeStructure: {
                                        select: {
                                            name: true,
                                        }
                                    },
                                    student: {
                                        include: {
                                            user: {
                                                select: { fullName: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { paidAt: 'desc' }
            });
            const formattedPayments = payments.map((payment) => ({
                id: payment.id,
                date: payment.paidAt,
                amount: Number(payment.amount),
                paidAmount: Number(payment.paidAmount),
                returnMoney: Number(payment.returnMoney || 0),
                orderDate: payment.createdAt,
                method: payment.method || 'bank_transfer',
                status: payment.status,
                transactionCode: payment.transactionCode,
                reference: payment.reference,
                notes: payment.notes,
                expirationDate: payment.expirationDate,
                allocations: (payment.feeRecordPayments || []).map((frp) => ({
                    feeRecordPaymentId: frp.id,
                    amount: Number(frp.feeRecord.totalAmount ?? frp.feeRecord.amount),
                    feeRecordId: frp.feeRecordId,
                    studentId: frp.feeRecord?.studentId,
                    studentName: frp.feeRecord?.student?.user?.fullName,
                    className: frp.feeRecord?.class?.name,
                    classCode: frp.feeRecord?.class?.classCode,
                    feeName: frp.feeRecord?.feeStructure?.name,
                    notes: frp.notes,
                }))
            }));
            return formattedPayments;
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Lỗi khi lấy lịch sử thanh toán',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentDetails(paymentId, parentId) {
        try {
            if (!(0, validate_util_1.checkId)(paymentId) || !(0, validate_util_1.checkId)(parentId)) {
                throw new common_1.HttpException({ message: 'ID không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const payment = await this.prisma.payment.findFirst({
                where: { id: paymentId, parentId },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    class: {
                                        select: {
                                            name: true,
                                            classCode: true,
                                        }
                                    },
                                    feeStructure: {
                                        select: {
                                            name: true,
                                            amount: true,
                                            period: true
                                        }
                                    },
                                    student: {
                                        select: {
                                            id: true,
                                            studentCode: true,
                                            user: {
                                                select: {
                                                    fullName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            });
            if (!payment) {
                throw new common_1.HttpException({ message: 'Không tìm thấy payment' }, common_1.HttpStatus.NOT_FOUND);
            }
            const formattedPayment = {
                id: payment.id,
                transactionCode: payment.transactionCode,
                status: payment.status,
                amount: Number(payment.amount),
                paidAmount: Number(payment.paidAmount) || 0,
                changeAmount: Number(payment.returnMoney) || 0,
                method: payment.method,
                createdAt: payment.createdAt,
                paidAt: payment.paidAt,
                expirationDate: payment.expirationDate,
                notes: payment.notes,
                reference: payment.reference,
                feeRecordPayments: payment.feeRecordPayments.map(frp => ({
                    id: frp.id,
                    feeRecordId: frp.feeRecordId,
                    feeRecord: {
                        id: frp.feeRecord.id,
                        amount: Number(frp.feeRecord.amount),
                        totalAmount: Number(frp.feeRecord.totalAmount),
                        discountAmount: Number(frp.feeRecord.amount) - Number(frp.feeRecord.totalAmount),
                        dueDate: frp.feeRecord.dueDate,
                        status: frp.feeRecord.status,
                        notes: frp.feeRecord.notes,
                        class: frp.feeRecord.class,
                        feeStructure: frp.feeRecord.feeStructure,
                        student: {
                            id: frp.feeRecord.student.id,
                            studentCode: frp.feeRecord.student.studentCode,
                            user: frp.feeRecord.student.user
                        }
                    }
                }))
            };
            return formattedPayment;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                message: 'Lỗi khi lấy chi tiết payment',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPaymentForFeeRecords(parentId, feeRecordIds) {
        try {
            if (!(0, validate_util_1.checkId)(parentId)) {
                throw new common_1.HttpException({ message: 'ID phụ huynh không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!feeRecordIds || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
                throw new common_1.HttpException({ message: 'Vui lòng chọn ít nhất một hóa đơn' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: {
                    id: { in: feeRecordIds },
                    status: 'pending',
                    student: { parentId }
                },
                include: { student: true }
            });
            if (feeRecords.length !== feeRecordIds.length) {
                throw new common_1.HttpException({ message: 'Một số hóa đơn không hợp lệ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
            const orderCode = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
            const expirationDate = new Date(feeRecords[0].dueDate);
            const payment = await this.prisma.payment.create({
                data: {
                    parentId,
                    amount: totalAmount,
                    status: 'pending',
                    transactionCode: orderCode,
                    createdAt: new Date(),
                    expirationDate: expirationDate,
                    method: 'bank_transfer',
                    feeRecordPayments: {
                        create: feeRecords.map(fr => ({
                            feeRecordId: fr.id
                        }))
                    }
                },
                include: { feeRecordPayments: true }
            });
            for (const fr of feeRecords) {
                await this.prisma.feeRecord.update({
                    where: { id: fr.id },
                    data: { status: 'processing' }
                });
            }
            return { data: payment, message: 'Tạo payment thành công' };
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Lỗi khi tạo payment', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePaymentFeeRecords(paymentId, feeRecordIds, parentId) {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { id: paymentId },
                include: { feeRecordPayments: true }
            });
            if (!payment || payment.status !== 'pending') {
                throw new common_1.HttpException({ message: 'Không thể cập nhật payment này' }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!feeRecordIds || feeRecordIds.length === 0) {
                throw new common_1.HttpException({ message: 'Phải có ít nhất 1 hóa đơn' }, common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.feeRecordPayment.deleteMany({
                where: {
                    paymentId,
                    feeRecordId: { notIn: feeRecordIds }
                }
            });
            const existingIds = payment.feeRecordPayments.map(frp => frp.feeRecordId);
            const toAdd = feeRecordIds.filter(id => !existingIds.includes(id));
            for (const frId of toAdd) {
                await this.prisma.feeRecordPayment.create({
                    data: { paymentId, feeRecordId: frId }
                });
            }
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: { id: { in: feeRecordIds } }
            });
            const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { amount: totalAmount }
            });
            return { data: true, message: 'Cập nhật payment thành công' };
        }
        catch (error) {
            throw new common_1.HttpException({ message: 'Lỗi khi cập nhật payment', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map