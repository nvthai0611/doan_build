export declare class CronJobFilterDto {
    jobType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class CronJobHistoryDto {
    jobType: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class CronJobStatsDto {
    jobType: string;
    days?: number;
}
