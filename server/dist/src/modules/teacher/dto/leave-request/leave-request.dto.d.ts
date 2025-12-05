export declare class LeaveRequestDto {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    affectedSessions?: AffectedSessionCreateDto[];
    image?: Express.Multer.File;
    imageUrl?: string;
}
export declare class AffectedSessionsQueryDto {
    startDate: string;
    endDate: string;
}
export declare class AffectedSessionItemDto {
    sessionId: string;
    date: string;
    time: string;
    className: string;
    room: string;
    selected: boolean;
    replacementTeacherId?: string;
}
export declare class ReplacementTeachersQueryDto {
    sessionId: string;
    date: string;
    time: string;
}
export declare class ReplacementTeacherDto {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    subjects: string[];
    compatibilityScore: number;
    compatibilityReason: string;
    isAvailable: boolean;
    availabilityNote?: string;
}
export declare class AffectedSessionCreateDto {
    id: string;
    replacementTeacherId?: string;
    notes?: string;
}
