interface SessionData {
    sessionDate: Date;
    startTime: string;
    endTime: string;
    status: string;
}
export declare function calculateSessionStatus(session: SessionData): string;
export declare function getSessionStatus(session: SessionData, overrideStatus?: string): string;
export declare function shouldUpdateSessionStatus(session: SessionData): boolean;
export declare function getSessionTimeInfo(session: SessionData): {
    now: Date;
    sessionStartDateTime: Date;
    sessionEndDateTime: Date;
    isBeforeSession: boolean;
    isDuringSession: boolean;
    isAfterSession: boolean;
    timeUntilStart: number;
    timeUntilEnd: number;
    timeSinceEnd: number;
};
export {};
