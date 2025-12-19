import { PrismaService } from 'src/db/prisma.service';
import { BillCronService } from '../../cronjob/service/bill-cron.service';
import { PayrollCronService } from '../../cronjob/service/payroll-teacherv2.service';
import { TriggerManagementService } from '../services/trigger-management.service';
import { CronJobFilterDto, CronJobHistoryDto, CronJobStatsDto } from '../dto/cron-job-filter.dto';
import { FeeReminderService } from '../../cronjob/service/send-email-bill.service';
import { ChangeStatusSessionService } from '../../cronjob/service/change-status-session.service';
export declare class JobTriggerController {
    private readonly billCron;
    private readonly payrollCron;
    private readonly feeReminder;
    private readonly prisma;
    private readonly triggerManagement;
    private readonly changeStatusSession;
    private readonly logger;
    constructor(billCron: BillCronService, payrollCron: PayrollCronService, feeReminder: FeeReminderService, prisma: PrismaService, triggerManagement: TriggerManagementService, changeStatusSession: ChangeStatusSessionService);
    triggerBillGeneration(): Promise<{
        message: string;
    }>;
    triggerPayrollGeneration(): Promise<{
        message: string;
    }>;
    triggerBillPublish(): Promise<{
        message: string;
    }>;
    triggerEarlyFeeReminder(): Promise<{
        message: string;
    }>;
    triggerDueFeeReminder(): Promise<{
        message: string;
    }>;
    triggerChangeStatusSession(): Promise<{
        message: string;
    }>;
    listCronJobs(filters: CronJobFilterDto): Promise<{
        data: {
            id: any;
            jobType: any;
            status: any;
            startedAt: any;
            completedAt: any;
            totalItems: any;
            successCount: any;
            failedCount: any;
            metadata: any;
            errorDetails: any;
            errorMessage: any;
            durationMs: any;
            createdAt: any;
            updatedAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        filters: {
            jobType: string;
            status: string;
            startDate: Date;
            endDate: Date;
        };
    }>;
    getAllTypeController(): Promise<{
        id: any;
        jobType: any;
        status: any;
        startedAt: any;
        completedAt: any;
        totalItems: any;
        successCount: any;
        failedCount: any;
        metadata: any;
        errorDetails: any;
        errorMessage: any;
        durationMs: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getLatestExecutions(): Promise<{
        data: {
            id: any;
            jobType: any;
            status: any;
            startedAt: any;
            completedAt: any;
            totalItems: any;
            successCount: any;
            failedCount: any;
            metadata: any;
            errorDetails: any;
            errorMessage: any;
            durationMs: any;
            createdAt: any;
            updatedAt: any;
        }[];
    }>;
    getJobTypes(): Promise<{
        data: string[];
    }>;
    getCronJobHistory(jobType: string, filters: Omit<CronJobHistoryDto, 'jobType'>): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            status: string;
            completedAt: Date | null;
            jobType: string;
            startedAt: Date;
            totalItems: number;
            successCount: number;
            failedCount: number;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
            durationMs: number | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        filters: {
            status: string;
            startDate: Date;
            endDate: Date;
        };
    }>;
    getCronJobStats(jobType: string, query: Omit<CronJobStatsDto, 'jobType'>): Promise<{
        data: {
            statusBreakdown: {
                status: string;
                count: number;
            }[];
            period: string;
            _count: number;
            _avg: {
                durationMs: number;
                successCount: number;
                failedCount: number;
            };
            _sum: {
                totalItems: number;
                successCount: number;
                failedCount: number;
            };
        };
    }>;
    getCronJobDetails(id: string): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            status: string;
            completedAt: Date | null;
            jobType: string;
            startedAt: Date;
            totalItems: number;
            successCount: number;
            failedCount: number;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
            durationMs: number | null;
        };
    }>;
    retryCronJob(id: string): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            status: string;
            completedAt: Date | null;
            jobType: string;
            startedAt: Date;
            totalItems: number;
            successCount: number;
            failedCount: number;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
            durationMs: number | null;
        };
        message: string;
    }>;
    private checkIfJobRunning;
}
