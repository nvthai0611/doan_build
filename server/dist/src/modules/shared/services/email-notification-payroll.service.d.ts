export declare class EmailNotificationPayrollService {
    sendPayrollNotificationEmail(payload: {
        teacherName: string;
        teacherEmail: string;
        payrollInfo: {
            period: string;
            totalAmount: string;
            bonuses: string;
            deductions: string;
            status: string;
        };
        payrollId: string;
    }): Promise<void>;
    sendPaymentConfirmationEmail(payload: {
        teacherName: string;
        teacherEmail: string;
        paymentInfo: {
            paymentId: string;
            totalAmount: string;
            paymentMethod: string;
            notes?: string;
            paidAt: string;
            payrollDetails: {
                payrollId: string;
                period: string;
                amount: number;
                bonuses: number;
                deductions: number;
                backPayAmount: number;
            }[];
            totalPayoutInClass?: number;
            payRate?: number;
        };
    }): Promise<void>;
    private formatCurrency;
}
