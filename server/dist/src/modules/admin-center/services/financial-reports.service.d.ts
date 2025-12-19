import { PrismaService } from '../../../db/prisma.service';
export declare class FinancialReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveAmount;
    private buildMonthlyTrend;
    private buildYearlyTrend;
    getSummary(month?: string, year?: string): Promise<{
        revenue: {
            totalPaid: number;
            monthCollected: number;
            prevMonthRevenue: number;
            monthlyTrend: {
                label: string;
                revenue: number;
                salary: number;
            }[];
            yearlyTrend: {
                label: string;
                revenue: number;
                salary: number;
            }[];
            revenueChangePercent: number;
            yearlyRevenueChangePercent: number;
            yearlyRevenue: number;
            classRevenue: number;
            prevMonthClassRevenue: any;
        };
        tuition: {
            paidAmount: number;
            pendingAmount: number;
            overdueAmount: number;
            breakdownPercent: {
                paid: number;
                pending: number;
                overdue: number;
            };
            outstandingStudentsCount: number;
        };
        classes: {
            topRevenue: {
                classId: string;
                className: any;
                subjectName: any;
                revenueAmount: number;
                studentCount: any;
            }[];
            totalClassRevenue: number;
        };
        payroll: {
            paidAmount: number;
            pendingAmount: number;
            teacherCountPaid: number;
            teacherCountPending: number;
            teacherSalaries: {
                id: bigint;
                teacherId: string;
                teacherName: string;
                email: string;
                salary: number;
                status: string;
                periodStart: string;
                periodEnd: string;
            }[];
            profitChangePercent: number;
            yearlyProfitChangePercent: number;
            yearlySalary: number;
        };
        students: {
            totalCount: number;
        };
        generatedAt: string;
    }>;
    getOutstandingStudents(month?: string, year?: string): Promise<any[]>;
    private getStudentsByStatus;
    getOverdueStudents(month?: string, year?: string): Promise<any[]>;
    getPendingStudents(month?: string, year?: string): Promise<any[]>;
    getClassStudentsStatus(month?: string, year?: string): Promise<any[]>;
}
