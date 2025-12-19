interface FeeReminderEmailParams {
    type: 'early' | 'due';
    parentEmail: string;
    parentName: string;
    feeRecords: any[];
    dueDate: Date;
}
export declare class EmailServiceNotificationBill {
    private readonly logger;
    sendFeeReminderEmail(params: FeeReminderEmailParams): Promise<void>;
    private generateEmailHTML;
    private formatCurrency;
    private formatDate;
}
export {};
