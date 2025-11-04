import { SepayService, CreatePaymentQRDto, SepayWebhookDto } from '../service/sepay.service';
export declare class SepayController {
    private readonly sepayService;
    constructor(sepayService: SepayService);
    createPaymentQR(req: any, dto: CreatePaymentQRDto): Promise<{
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
    regeneratePaymentQR(body: any): Promise<{
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
    handleSepayWebhook(webhookData: SepayWebhookDto): Promise<{
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
    getSepayTransactions(limit?: number): Promise<any[]>;
    verifySepayTransaction(orderCode: string): Promise<{
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
    sendTestEmail(): Promise<void>;
}
