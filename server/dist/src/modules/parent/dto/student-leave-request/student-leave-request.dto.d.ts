export declare class CreateStudentLeaveRequestDto {
    studentId: string;
    classId: string;
    sessionIds: string[];
    reason: string;
}
export declare class UpdateStudentLeaveRequestDto {
    reason?: string;
    sessionIds?: string[];
}
export declare class GetStudentLeaveRequestsQueryDto {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: string;
    classId?: string;
}
export declare class GetSessionsByClassQueryDto {
    studentId: string;
    classId: string;
}
