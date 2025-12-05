export declare class CreateSessionRequestDto {
    classId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    roomId?: string;
    reason: string;
    notes?: string;
    requestType: 'makeup_session' | 'extra_session';
}
