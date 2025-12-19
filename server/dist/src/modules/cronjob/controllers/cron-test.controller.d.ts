import { ProgressReportCronService } from '../service/progress-report-cron.service';
export declare class CronTestController {
    private progressReportCron;
    constructor(progressReportCron: ProgressReportCronService);
    triggerProgressReports(body?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
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
}
