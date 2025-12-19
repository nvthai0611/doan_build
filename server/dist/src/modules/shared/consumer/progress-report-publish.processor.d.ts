import { Job } from 'bull';
import { PrismaService } from 'src/db/prisma.service';
interface ProgressReportPublishData {
    reportId: string;
    teacherId: string;
}
export declare class ProgressReportPublishProcessor {
    private prisma;
    constructor(prisma: PrismaService);
    handlePublishReport(job: Job<ProgressReportPublishData>): Promise<{
        success: boolean;
        error: string;
        reportId?: undefined;
    } | {
        success: boolean;
        reportId: string;
        error?: undefined;
    }>;
}
export {};
