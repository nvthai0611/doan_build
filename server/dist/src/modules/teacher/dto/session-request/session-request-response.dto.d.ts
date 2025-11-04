export declare class SessionRequestResponseDto {
    id: string;
    requestType: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    notes?: string;
    status: string;
    createdAt: Date;
    approvedAt?: Date;
    class: {
        id: string;
        name: string;
        subject: {
            name: string;
        };
    };
    room?: {
        id: string;
        name: string;
    };
    teacher: {
        id: string;
        user: {
            fullName: string;
        };
    };
    createdByUser: {
        id: string;
        fullName: string;
    };
    approvedByUser?: {
        id: string;
        fullName: string;
    };
}
