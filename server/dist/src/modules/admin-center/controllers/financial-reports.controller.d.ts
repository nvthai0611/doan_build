import { FinancialReportsService } from '../services/financial-reports.service';
export declare class FinancialReportsController {
    private readonly financialReportsService;
    constructor(financialReportsService: FinancialReportsService);
    getSummary(month?: string, year?: string): Promise<{
        data: {
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
        };
        message: string;
    }>;
    getOutstandingStudents(month?: string, year?: string): Promise<{
        data: any[];
        message: string;
    }>;
    getOverdueStudents(month?: string, year?: string): Promise<{
        data: any[];
        message: string;
    }>;
    getPendingStudents(month?: string, year?: string): Promise<{
        data: any[];
        message: string;
    }>;
    getClassStudentsStatus(month?: string, year?: string): Promise<{
        data: any[];
        message: string;
    }>;
}
