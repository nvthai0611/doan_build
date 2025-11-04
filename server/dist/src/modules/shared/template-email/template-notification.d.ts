export declare const studentAbsenceEmailTemplate: (studentName: string, className: string, absenceDate: string, sessionTime?: string, subject?: string, teacherName?: string, note?: string) => string;
export declare const multipleAbsenceEmailTemplate: (studentName: string, className: string, absenceCount: number, absenceDates: string[], totalSessions: number, attendanceRate: number) => string;
export declare const paymentSuccessEmailTemplate: (data: {
    parentName: string;
    orderCode: string;
    totalAmount: number;
    paymentDate: string;
    paymentTime: string;
    paymentMethod: string;
    bankName?: string;
    transactionCode?: string;
    students: Array<{
        studentName: string;
        studentCode: string;
        className: string;
        feeAmount: number;
        feeDescription?: string;
    }>;
}) => string;
