import { PrismaService } from '../../../../src/db/prisma.service';
export declare class ProgressReportCronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateMonthlyProgressReports(): Promise<{
        message: string;
        created: number;
        periodLabel?: undefined;
        skipped?: undefined;
        errors?: undefined;
    } | {
        message: string;
        periodLabel: string;
        created: number;
        skipped: number;
        errors: any[];
    }>;
    generateReportsForPeriod(customStart?: Date, customEnd?: Date): Promise<{
        message: string;
        created: number;
        periodLabel?: undefined;
        skipped?: undefined;
        errors?: undefined;
    } | {
        message: string;
        periodLabel: string;
        created: number;
        skipped: number;
        errors: any[];
    }>;
    private computeStudentMetrics;
    private computeStudentMetricsForClass;
    private computeTrend;
    private generateAutoComment;
    private generateScoreOnlyComment;
    private generateAttendanceOnlyComment;
    private generateCombinedComment;
}
