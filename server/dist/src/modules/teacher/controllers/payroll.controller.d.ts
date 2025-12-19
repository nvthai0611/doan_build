import { PayrollService } from '../services/payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    getTeacherPayrolls(req: any, month?: string, status?: string, page?: string, limit?: string): Promise<any>;
    getPayrollDetail(payrollId: string, classId?: string, startDate?: string, endDate?: string, page?: string, limit?: string): Promise<any>;
    approvePayroll(req: any, payrollId: string): Promise<{
        id: bigint;
        status: string;
        teacherId: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        periodStart: Date;
        periodEnd: Date;
        computedDetails: import("@prisma/client/runtime/library").JsonValue | null;
        backPayAmount: import("@prisma/client/runtime/library").Decimal | null;
        bonuses: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        adjustmentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        teachingHours: import("@prisma/client/runtime/library").Decimal | null;
        adminPublishedAt: Date | null;
        teacherActionAt: Date | null;
        teacherRejectionReason: string | null;
        payrollPaymentId: bigint | null;
    }>;
    rejectPayroll(req: any, payrollId: string, teacherRejectionReason: string): Promise<{
        data: {
            id: bigint;
            status: string;
            teacherId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            periodStart: Date;
            periodEnd: Date;
            computedDetails: import("@prisma/client/runtime/library").JsonValue | null;
            backPayAmount: import("@prisma/client/runtime/library").Decimal | null;
            bonuses: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            adjustmentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            teachingHours: import("@prisma/client/runtime/library").Decimal | null;
            adminPublishedAt: Date | null;
            teacherActionAt: Date | null;
            teacherRejectionReason: string | null;
            payrollPaymentId: bigint | null;
        };
        message: string;
    }>;
}
