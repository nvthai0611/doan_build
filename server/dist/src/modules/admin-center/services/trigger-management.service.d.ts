import { PrismaService } from "../../../db/prisma.service";
export declare class TriggerManagementService {
    private prismaService;
    constructor(prismaService: PrismaService);
    private formatJobExecution;
    listCronJobs(filters: {
        jobType?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
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
    getJobTypes(): Promise<{
        data: string[];
    }>;
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
    getCronJobHistory(jobType: string, filters: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
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
    getCronJobStats(jobType: string, days?: number): Promise<{
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
    getAllType(): Promise<{
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
}
