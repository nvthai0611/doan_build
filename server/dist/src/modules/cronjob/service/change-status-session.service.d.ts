import { PrismaService } from "../../../db/prisma.service";
export declare class ChangeStatusSessionService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    changeStatusSession(): Promise<void>;
    manualChangeStatusSession(): Promise<void>;
    getCronJobHistory(limit?: number): Promise<{
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
    }[]>;
    getCronJobStats(): Promise<{
        jobType: string;
        stats: {
            status: string;
            count: number;
            averageDurationMs: number;
            totalItemsProcessed: number;
            totalSuccess: number;
            totalFailed: number;
        }[];
    }>;
}
