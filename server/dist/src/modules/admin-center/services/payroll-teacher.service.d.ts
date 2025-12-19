import { PrismaService } from "../../../db/prisma.service";
export declare class PayRollTeacherService {
    private prisma;
    constructor(prisma: PrismaService);
    getListTeachers(teacherName: string, email: string, status: string, month?: string): Promise<any[]>;
    getAllPayrollsByTeacherId(teacherId: string, year?: string, classId?: string): Promise<{
        data: ({
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
                id: string;
            };
            payrollPayment: {
                teacherId: string;
                id: bigint;
                paidAt: Date;
                notes: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paidByUserId: string;
                paymentMethod: string;
            };
        } & {
            status: string;
            teacherId: string;
            id: bigint;
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
        })[];
        message: string;
    }>;
    getDetailPayrollTeacher(teacherId: string, month?: string, classId?: string): Promise<{
        data: ({
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
                id: string;
            };
            payoutDetails: ({
                session: {
                    class: {
                        name: string;
                        id: string;
                        classCode: string;
                    };
                } & {
                    status: string;
                    roomId: string | null;
                    teacherId: string | null;
                    createdAt: Date;
                    academicYear: string;
                    id: string;
                    notes: string | null;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    cancellationReason: string | null;
                };
            } & {
                status: string;
                teacherId: string;
                id: bigint;
                sessionId: string;
                studentCount: number;
                payrollId: bigint | null;
                sessionFeePerStudent: import("@prisma/client/runtime/library").Decimal;
                totalRevenue: import("@prisma/client/runtime/library").Decimal;
                payoutRate: import("@prisma/client/runtime/library").Decimal;
                teacherPayout: import("@prisma/client/runtime/library").Decimal;
                calculatedAt: Date;
            })[];
        } & {
            status: string;
            teacherId: string;
            id: bigint;
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
        })[];
        message: string;
    }>;
    getPayrollById(payrollId: string): Promise<{
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
                id: string;
            };
            payrollPayment: {
                teacherId: string;
                id: bigint;
                paidAt: Date;
                notes: string | null;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paidByUserId: string;
                paymentMethod: string;
            };
            payoutDetails: ({
                session: {
                    status: string;
                    teacher: {
                        user: {
                            fullName: string;
                            email: string;
                            id: string;
                        };
                        id: string;
                    };
                    class: {
                        name: string;
                        id: string;
                        classCode: string;
                    };
                    id: string;
                    notes: string;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    substituteTeacher: {
                        user: {
                            fullName: string;
                            email: string;
                            id: string;
                        };
                        id: string;
                    };
                };
            } & {
                status: string;
                teacherId: string;
                id: bigint;
                sessionId: string;
                studentCount: number;
                payrollId: bigint | null;
                sessionFeePerStudent: import("@prisma/client/runtime/library").Decimal;
                totalRevenue: import("@prisma/client/runtime/library").Decimal;
                payoutRate: import("@prisma/client/runtime/library").Decimal;
                teacherPayout: import("@prisma/client/runtime/library").Decimal;
                calculatedAt: Date;
            })[];
        } & {
            status: string;
            teacherId: string;
            id: bigint;
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
        };
        message: string;
    }>;
    getClassSessionsByClassId(classId: string, month?: string, teacherId?: string): Promise<{
        data: ({
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
                id: string;
            };
            class: {
                name: string;
                id: string;
                classCode: string;
            };
            teacherSessionPayout: {
                status: string;
                id: bigint;
                studentCount: number;
                sessionFeePerStudent: import("@prisma/client/runtime/library").Decimal;
                totalRevenue: import("@prisma/client/runtime/library").Decimal;
                payoutRate: import("@prisma/client/runtime/library").Decimal;
                teacherPayout: import("@prisma/client/runtime/library").Decimal;
                calculatedAt: Date;
            };
            substituteTeacher: {
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
                id: string;
            };
        } & {
            status: string;
            roomId: string | null;
            teacherId: string | null;
            createdAt: Date;
            academicYear: string;
            id: string;
            notes: string | null;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            cancellationReason: string | null;
        })[];
        message: string;
    }>;
}
