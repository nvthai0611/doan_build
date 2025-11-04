export declare enum ScheduleChangeStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class ScheduleChangeFiltersDto {
    page?: number;
    limit?: number;
    status?: ScheduleChangeStatus;
    changeType?: string;
    classId?: number;
}
