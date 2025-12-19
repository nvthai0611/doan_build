import { FinancialManagementService } from '../services/financial-management.service';
export declare class FinancialManagementController {
    private readonly financialManagementService;
    constructor(financialManagementService: FinancialManagementService);
    getSessionFeeStructures(): Promise<{
        data: ({
            subject: {
                id: string;
                name: string;
                code: string;
            };
            grade: {
                level: number;
                id: string;
                name: string;
            };
        } & {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            description: string | null;
            subjectId: string | null;
            gradeId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            period: string;
        })[];
        message: string;
    }>;
    getSessionFeeMatrix(): Promise<{
        data: {
            matrix: {
                grade: {
                    id: string;
                    name: string;
                    level: number;
                };
                subjects: {
                    subject: {
                        id: string;
                        name: string;
                        code: string;
                    };
                    fee: {
                        id: string;
                        amount: number;
                        name: string;
                    };
                }[];
            }[];
            grades: {
                level: number;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
            }[];
            subjects: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            }[];
            totalGrades: number;
            totalSubjects: number;
        };
        message: string;
    }>;
    getGrades(): Promise<{
        data: {
            level: number;
            isActive: boolean;
            id: string;
            name: string;
            description: string | null;
        }[];
        message: string;
    }>;
    getSubjects(): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            code: string;
        }[];
        message: string;
    }>;
    upsertSessionFee(body: {
        gradeId: string;
        subjectId: string;
        amount: number;
    }): Promise<{
        data: {
            subject: {
                id: string;
                name: string;
                code: string;
            };
            grade: {
                level: number;
                id: string;
                name: string;
            };
        } & {
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
        message: string;
    }>;
    bulkUpdateSessionFees(body: {
        updates: Array<{
            gradeId: string;
            subjectId: string;
            amount: number;
        }>;
    }): Promise<{
        data: any[];
        message: string;
    }>;
    deleteSessionFee(id: string): Promise<{
        message: string;
    }>;
}
