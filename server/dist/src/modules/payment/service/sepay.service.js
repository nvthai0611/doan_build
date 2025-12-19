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
var SepayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SepayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../../../db/prisma.service");
const template_notification_1 = require("../../shared/template-email/template-notification");
const email_util_1 = require("../../../utils/email.util");
const payment_gateway_1 = require("../gateway/payment.gateway");
const function_util_1 = require("../../../utils/function.util");
let SepayService = SepayService_1 = class SepayService {
    constructor(httpService, configService, prisma, paymentGateway) {
        this.httpService = httpService;
        this.configService = configService;
        this.prisma = prisma;
        this.paymentGateway = paymentGateway;
        this.logger = new common_1.Logger(SepayService_1.name);
        this.baseURL = 'https://my.sepay.vn/userapi';
        this.apiKey = this.configService.get('SEPAY_API_KEY');
        this.accountNumber =
            this.configService.get('SEPAY_ACCOUNT_VA') || '9624716YAW';
        this.bankCode = this.configService.get('SEPAY_BANK_NAME') || 'BIDV';
        this.bankAccountName =
            this.configService.get('SEPAY_BANK_ACCOUNT_NAME') ||
                'TRUNG TAM GIAO DUC';
    }
    async createPaymentQR(userId, dto) {
        const { feeRecordIds } = dto;
        if (!userId || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
            throw new common_1.BadRequestException('Thiếu thông tin userId hoặc feeRecordIds');
        }
        const findParentByUserId = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { parent: true }
        });
        if (!findParentByUserId || !findParentByUserId.parent) {
            throw new common_1.BadRequestException('Không tìm thấy phụ huynh');
        }
        const parentId = findParentByUserId.parent.id;
        return await this.prisma.$transaction(async (tx) => {
            const feeRecords = await tx.feeRecord.findMany({
                where: {
                    id: { in: feeRecordIds },
                    status: 'pending',
                    student: { parentId }
                },
                include: {
                    student: true
                }
            });
            if (feeRecords.length !== feeRecordIds.length) {
                throw new common_1.BadRequestException('Một số hóa đơn không hợp lệ');
            }
            const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
            const orderCode = (0, function_util_1.createOrderCode)();
            const expirationDate = new Date(feeRecords[0].dueDate);
            const payment = await tx.payment.create({
                data: {
                    parentId,
                    amount: totalAmount,
                    status: 'pending',
                    transactionCode: orderCode,
                    createdAt: new Date(),
                    expirationDate,
                    method: 'bank_transfer',
                    feeRecordPayments: {
                        create: feeRecords.map(fr => ({
                            feeRecordId: fr.id
                        }))
                    }
                },
                include: { feeRecordPayments: true }
            });
            await tx.feeRecord.updateMany({
                where: { id: { in: feeRecordIds } },
                data: { status: 'processing' }
            });
            const studentCodes = feeRecords.map(fr => fr.student.studentCode);
            const studentsCodeStr = studentCodes.join(' ');
            const content = `${payment.transactionCode}`;
            const qrCodeUrl = this.generateVietQRContent({
                accountNumber: this.accountNumber,
                bankCode: this.bankCode,
                amount: totalAmount,
                content,
                bankAccountName: this.bankAccountName,
            });
            return {
                data: {
                    paymentId: payment.id,
                    orderCode: payment.transactionCode,
                    qrCodeUrl,
                    totalAmount,
                    content,
                    accountNumber: this.accountNumber,
                    bankCode: this.bankCode,
                    bankName: this.getBankName(this.bankCode),
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                    summary: {
                        totalStudents: studentCodes.length,
                        studentCodes: studentsCodeStr,
                    }
                },
                message: 'Tạo mã QR thanh toán thành công'
            };
        });
    }
    async regeneratePaymentQR(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                parent: true
            }
        });
        if (!payment) {
            throw new common_1.BadRequestException('Không tìm thấy payment');
        }
        const qrCodeUrl = this.generateVietQRContent({
            accountNumber: this.accountNumber,
            bankCode: this.bankCode,
            amount: Number(payment.amount),
            content: payment.transactionCode,
            bankAccountName: this.bankAccountName,
        });
        return {
            data: {
                paymentId: payment.id,
                orderCode: payment.transactionCode,
                qrCodeUrl,
                totalAmount: payment.amount,
                content: payment.transactionCode,
                accountNumber: this.accountNumber,
                bankCode: this.bankCode,
                bankName: this.getBankName(this.bankCode),
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
            message: 'Tạo lại mã QR thành công'
        };
    }
    getBankName(bankCode) {
        const bankNames = {
            MB: 'MB Bank',
            VCB: 'Vietcombank',
            TCB: 'Techcombank',
            ACB: 'ACB',
            VPB: 'VPBank',
            TPB: 'TPBank',
            STB: 'Sacombank',
            BIDV: 'BIDV',
        };
        return bankNames[bankCode] || bankCode;
    }
    async getTransactions(limit = 50) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseURL}/transactions/list`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                params: {
                    limit,
                    account_number: this.accountNumber,
                },
            }));
            return response.data.transactions || [];
        }
        catch (error) {
            this.logger.error('Lỗi khi lấy danh sách giao dịch từ Sepay', error);
            throw error;
        }
    }
    async handleWebhook(webhookData) {
        try {
            this.logger.log(`Nhận webhook từ Sepay: ${JSON.stringify(webhookData)}`);
            if (!webhookData.transferAmount || webhookData.transferAmount <= 0) {
                this.logger.warn('Số tiền giao dịch không hợp lệ');
                return { data: null, message: 'Số tiền giao dịch không hợp lệ' };
            }
            if (webhookData.transferType !== 'in') {
                this.logger.warn('Không phải giao dịch nhận tiền');
                return { data: null, message: 'Không phải giao dịch nhận tiền' };
            }
            if (!webhookData.content) {
                this.logger.warn('Nội dung giao dịch trống');
                return { data: null, message: 'Nội dung giao dịch trống' };
            }
            const orderCode = (0, function_util_1.extractOrderCode)(webhookData.content);
            if (!orderCode) {
                this.logger.warn(`Không tìm thấy mã đơn hàng trong nội dung: ${webhookData.content}`);
                return { data: null, message: 'Không tìm thấy mã đơn hàng' };
            }
            const payment = await this.prisma.payment.findFirst({
                where: { transactionCode: orderCode },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    student: { include: { user: true } },
                                    class: true
                                }
                            }
                        }
                    },
                    parent: { include: { user: true } }
                }
            });
            if (!payment) {
                this.logger.warn('Không tìm thấy payment');
                return { data: null, message: 'Không tìm thấy payment' };
            }
            if (['completed', 'partially_paid'].includes(payment.status)) {
                this.logger.warn('Payment đã được xử lý trước đó');
                return { data: { paymentId: payment.id }, message: 'Payment đã được xử lý trước đó' };
            }
            const expectedAmount = Number(payment.amount);
            const paidAmount = Number(webhookData.transferAmount);
            let newStatus;
            let feeRecordStatus;
            if (paidAmount >= expectedAmount) {
                newStatus = 'completed';
                feeRecordStatus = 'paid';
            }
            else {
                newStatus = 'partially_paid';
                feeRecordStatus = 'partially_paid';
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: newStatus,
                        reference: webhookData.referenceCode || null,
                        paidAt: new Date(webhookData.transactionDate),
                        paidAmount,
                        notes: `Thanh toán qua ${webhookData.gateway}`,
                    }
                });
                for (const frp of payment.feeRecordPayments) {
                    await tx.feeRecord.update({
                        where: { id: frp.feeRecordId },
                        data: { status: feeRecordStatus }
                    });
                }
            });
            if (payment.parent?.user?.email) {
                const emailData = {
                    parentName: payment.parent.user.fullName,
                    orderCode,
                    totalAmount: paidAmount,
                    paymentDate: new Date(webhookData.transactionDate).toLocaleDateString('vi-VN'),
                    paymentTime: new Date(webhookData.transactionDate).toLocaleTimeString('vi-VN'),
                    paymentMethod: 'Chuyển khoản ngân hàng',
                    bankName: webhookData.gateway,
                    transactionCode: webhookData.referenceCode,
                    students: payment.feeRecordPayments.map((frp) => ({
                        studentName: frp.feeRecord.student.user.fullName,
                        studentCode: frp.feeRecord.student.studentCode,
                        className: frp.feeRecord.class?.name || '',
                        feeAmount: frp.feeRecord.totalAmount,
                        feeDescription: 'Thanh toán học phí'
                    })),
                };
                await this.sendSuccessPayment(emailData, payment.parent.user.email, 'Xác nhận thanh toán học phí thành công');
            }
            this.paymentGateway.notifyPaymentSuccess(orderCode, {
                orderCode,
                paymentId: payment.id,
                amount: paidAmount,
                paidAt: new Date(webhookData.transactionDate).toISOString(),
            });
            return {
                data: {
                    paymentId: payment.id,
                    orderCode,
                    paidAmount,
                    status: newStatus,
                },
                message: 'Xử lý thanh toán thành công'
            };
        }
        catch (error) {
            this.logger.error('Lỗi khi xử lý webhook', error);
            throw error;
        }
    }
    async verifyTransaction(orderCode) {
        try {
            const payment = await this.prisma.payment.findFirst({
                where: {
                    OR: [
                        { transactionCode: orderCode },
                        { reference: orderCode }
                    ],
                    status: 'completed'
                },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    student: { include: { user: true } },
                                    class: true,
                                    feeStructure: true
                                }
                            }
                        }
                    },
                    parent: { include: { user: true } }
                }
            });
            if (!payment) {
                return {
                    data: { orderCode, status: 'waiting', message: 'Giao dịch chưa được xác nhận' },
                    message: 'Chưa tìm thấy giao dịch'
                };
            }
            return {
                data: {
                    orderCode,
                    paymentId: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    paidAt: payment.paidAt,
                    allocations: payment.feeRecordPayments.map(pr => ({
                        feeRecordId: pr.feeRecordId,
                        studentName: pr.feeRecord.student.user.fullName,
                        studentCode: pr.feeRecord.student.studentCode,
                        className: pr.feeRecord.class?.name
                    }))
                },
                message: 'Lấy thông tin giao dịch thành công'
            };
        }
        catch (error) {
            this.logger.error(`Lỗi khi xác minh giao dịch: ${orderCode}`, error);
            throw error;
        }
    }
    generateVietQRContent(params) {
        const { accountNumber, bankCode, amount, content, bankAccountName } = params;
        const encodedContent = encodeURIComponent(content);
        const encodedBankAccountName = encodeURIComponent(bankAccountName);
        return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedBankAccountName}`;
    }
    async sendTestEmail() {
        try {
            const emailTemplate = {
                parentName: 'Nguyen Van A',
                orderCode: 'HP123456789',
                totalAmount: 1000000,
                paymentDate: '01/01/2024',
                paymentTime: '10:00:00',
                paymentMethod: 'Chuyển khoản ngân hàng',
                bankName: 'Vietcombank',
                transactionCode: 'TX123456789',
                students: [
                    {
                        studentName: 'Nguyen Van A',
                        studentCode: 'STU001',
                        className: 'Lop 1A',
                        feeAmount: 500000,
                        feeDescription: 'Học phí tháng 1',
                    },
                    {
                        studentName: 'Nguyen Van A',
                        studentCode: 'STU001',
                        className: 'Lop 1A',
                        feeAmount: 500000,
                        feeDescription: 'Học phí tháng 1',
                    },
                ],
            };
            await this.sendSuccessPayment(emailTemplate, 'nguyenbaha0805@gmail.com', 'Xác nhận thanh toán học phí thành công');
            console.log('Đã gửi email test thành công');
        }
        catch (error) {
            this.logger.error('Failed to send test email', error);
            throw error;
        }
    }
    async sendSuccessPayment(emailData, to, subject) {
        try {
            const emailTemplate = (0, template_notification_1.paymentSuccessEmailTemplate)(emailData);
            await (0, email_util_1.default)(to, subject, emailTemplate);
            console.log(`✅ Đã gửi email xác nhận thanh toán thành công đến ${to}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Lỗi khi gửi email xác nhận thanh toán: ${error.message}`);
            return false;
        }
    }
};
exports.SepayService = SepayService;
exports.SepayService = SepayService = SepayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        payment_gateway_1.PaymentGateway])
], SepayService);
//# sourceMappingURL=sepay.service.js.map