import { PrismaService } from '../../../db/prisma.service';
interface GetTeacherPayrollParams {
    teacherId: string;
    month?: string;
    status?: string;
    page?: number;
    limit?: number;
}
interface GetPayrollDetailParams {
    payrollId: string;
    classId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
interface PayrollResponse {
    data: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    message: string;
}
interface PayrollDetailResponse {
    payroll: any;
    sessions: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    summary: {
        totalSessions: number;
        totalPayout: number;
        regularSessions: number;
        substituteSessions: number;
    };
    message: string;
}
export declare class PayrollService {
    private prisma;
    constructor(prisma: PrismaService);
    getTeacherPayroll(params: GetTeacherPayrollParams): Promise<PayrollResponse>;
    getPayrollDetail(params: GetPayrollDetailParams): Promise<PayrollDetailResponse>;
    approvePayroll(teacherId: string, payrollId: string): Promise<{
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
    rejectPayroll(teacherId: string, payrollId: string, rejectionReason: string): Promise<{
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
export {};
