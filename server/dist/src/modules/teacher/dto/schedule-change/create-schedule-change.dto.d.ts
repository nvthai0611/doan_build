export declare enum ScheduleChangeType {
    RESCHEDULE = "reschedule",
    CANCEL = "cancel",
    EXTEND = "extend"
}
export declare class CreateScheduleChangeDto {
    classId: number;
    sessionId: number;
    changeType: ScheduleChangeType;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    newRoomId?: number;
    reason: string;
    notes?: string;
}
