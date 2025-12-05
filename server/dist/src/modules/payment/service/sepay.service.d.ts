import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/db/prisma.service';
import { PaymentGateway } from '../gateway/payment.gateway';
export interface SepayTransaction {
    id: string;
    gateway: string;
    transaction_date: string;
    account_number: string;
    sub_account: string;
    amount_in: number;
    amount_out: number;
    accumulated: number;
    code: string;
    transaction_content: string;
    reference_number: string;
    body: string;
    bank_brand_name: string;
    bank_account_id: string;
}
export interface CreatePaymentQRDto {
    feeRecordIds: string[];
}
export interface SepayWebhookDto {
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    subAccount: string;
    code: string | null;
    content: string;
    transferType: string;
    description: string;
    transferAmount: number;
    referenceCode: string;
    accumulated: number;
    id: number;
}
export declare class SepayService {
    private readonly httpService;
    private readonly configService;
    private readonly prisma;
    private readonly paymentGateway;
    private readonly logger;
    private readonly baseURL;
    private readonly apiKey;
    private readonly accountNumber;
    private readonly bankCode;
    private readonly bankAccountName;
    constructor(httpService: HttpService, configService: ConfigService, prisma: PrismaService, paymentGateway: PaymentGateway);
    createPaymentQR(userId: string, dto: CreatePaymentQRDto): Promise<{
        data: {
            paymentId: string;
            orderCode: string;
            qrCodeUrl: string;
            totalAmount: number;
            content: string;
            accountNumber: string;
            bankCode: string;
            bankName: string;
            expiresAt: Date;
            summary: {
                totalStudents: number;
                studentCodes: string;
            };
        };
        message: string;
    }>;
    regeneratePaymentQR(paymentId: string): Promise<{
        data: {
            paymentId: string;
            orderCode: string;
            qrCodeUrl: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            content: string;
            accountNumber: string;
            bankCode: string;
            bankName: string;
            expiresAt: Date;
        };
        message: string;
    }>;
    private getBankName;
    getTransactions(limit?: number): Promise<any[]>;
    handleWebhook(webhookData: SepayWebhookDto): Promise<{
        data: {
            paymentId: string;
            orderCode?: undefined;
            paidAmount?: undefined;
            status?: undefined;
        };
        message: string;
    } | {
        data: {
            paymentId: string;
            orderCode: string;
            paidAmount: number;
            status: "completed" | "partially_paid";
        };
        message: string;
    }>;
    verifyTransaction(orderCode: string): Promise<{
        data: {
            orderCode: string;
            status: string;
            message: string;
            paymentId?: undefined;
            amount?: undefined;
            paidAt?: undefined;
            allocations?: undefined;
        };
        message: string;
    } | {
        data: {
            orderCode: string;
            paymentId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: string;
            paidAt: Date;
            allocations: {
                feeRecordId: string;
                studentName: string;
                studentCode: string;
                className: string;
            }[];
            message?: undefined;
        };
        message: string;
    }>;
    private generateVietQRContent;
    sendTestEmail(): Promise<void>;
    sendSuccessPayment(emailData: any, to: any, subject: any): Promise<boolean>;
}
