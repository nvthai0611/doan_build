import { PayRollTeacherService } from "../services/payroll-teacher.service";
export declare class PayrollTeacherController {
    private readonly PayRollTeacherService;
    constructor(PayRollTeacherService: PayRollTeacherService);
    getListTeachers(teacherName: string, email: string, status: string, month: string): Promise<({
        payrolls: {
            id: bigint;
            teacherId: string;
            status: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            periodStart: Date;
            periodEnd: Date;
            computedDetails: import("@prisma/client/runtime/library").JsonValue | null;
            bonuses: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            teachingHours: import("@prisma/client/runtime/library").Decimal | null;
            adminPublishedAt: Date | null;
            teacherActionAt: Date | null;
            teacherRejectionReason: string | null;
            payrollPaymentId: bigint | null;
        }[];
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        payrollPayments: {
            id: bigint;
            teacherId: string;
            notes: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paidByUserId: string;
            paymentMethod: string;
            paidAt: Date;
        }[];
    } & {
        createdAt: Date;
        id: string;
        updatedAt: Date;
        userId: string;
        teacherCode: string;
        schoolId: string | null;
        subjects: string[];
    })[]>;
}
