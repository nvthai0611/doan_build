import { FinancialService } from '../services/financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    getAllFeeRecordsForParent(req: any, status: string): Promise<{
        student: {
            attendedSessionsCount: number;
            user: {
                fullName: string;
            };
            school: {
                createdAt: Date;
                phone: string | null;
                updatedAt: Date;
                id: string;
                name: string;
                address: string | null;
            };
            attendances: ({
                session: {
                    academicYear: string;
                    createdAt: Date;
                    id: string;
                    roomId: string | null;
                    teacherId: string | null;
                    status: string;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    notes: string | null;
                    cancellationReason: string | null;
                };
            } & {
                id: bigint;
                sessionId: string;
                status: string;
                studentId: string;
                note: string | null;
                recordedBy: string;
                recordedAt: Date;
                isSent: boolean;
                sentAt: Date | null;
            })[];
            grade: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            studentCode: string | null;
            address: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        class: {
            sessions: {
                academicYear: string;
                createdAt: Date;
                id: string;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                classId: string;
                substituteTeacherId: string | null;
                substituteEndDate: Date | null;
                sessionDate: Date;
                startTime: string;
                endTime: string;
                notes: string | null;
                cancellationReason: string | null;
            }[];
        } & {
            academicYear: string | null;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            name: string;
            description: string | null;
            subjectId: string;
            gradeId: string | null;
            maxStudents: number | null;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeStructureId: string | null;
            classCode: string | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
        feeStructure: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            description: string | null;
            subjectId: string | null;
            gradeId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            period: string;
        };
        scholarship: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        id: string;
        status: string;
        feeStructureId: string;
        studentId: string;
        classId: string | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getFeeRecordDetail(req: any, id: string): Promise<{
        id: string;
        transactionCode: string;
        status: string;
        amount: number;
        paidAmount: number;
        changeAmount: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        createdAt: Date;
        paidAt: Date;
        expirationDate: Date;
        notes: string;
        reference: string;
        feeRecordPayments: {
            id: string;
            feeRecordId: string;
            feeRecord: {
                id: string;
                amount: number;
                totalAmount: number;
                discountAmount: number;
                dueDate: Date;
                status: string;
                notes: string;
                class: {
                    name: string;
                    classCode: string;
                };
                feeStructure: {
                    name: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
                student: {
                    id: string;
                    studentCode: string;
                    user: {
                        fullName: string;
                    };
                };
            };
        }[];
    }>;
    getPaymentByStatus(req: any, status: string): Promise<{
        id: any;
        date: any;
        amount: number;
        paidAmount: number;
        returnMoney: number;
        orderDate: any;
        method: any;
        status: any;
        transactionCode: any;
        reference: any;
        notes: any;
        expirationDate: any;
        allocations: any;
    }[]>;
    createPaymentForFeeRecords(req: any, feeRecordIds: string[]): Promise<{
        data: {
            feeRecordPayments: {
                createdAt: Date | null;
                updatedAt: Date | null;
                id: string;
                notes: string | null;
                paymentId: string | null;
                feeRecordId: string | null;
            }[];
        } & {
            createdAt: Date | null;
            updatedAt: Date | null;
            id: string;
            parentId: string | null;
            status: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
        };
        message: string;
    }>;
    updatePaymentFeeRecords(req: any, paymentId: string, feeRecordIds: string[]): Promise<{
        data: boolean;
        message: string;
    }>;
}
