export declare class CreatePaymentQRDto {
    feeRecordId: string;
    amount: number;
    parentId?: string;
}
export interface FeeRecordPaymentInfo {
    feeRecordId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    amount: number;
    remainingAmount: number;
}
