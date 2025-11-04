export declare class CreateStudentLeaveRequestDto {
    studentId: string;
    startDate: string;
    endDate: string;
    reason: string;
}
export declare class UpdateStudentLeaveRequestDto {
    startDate?: string;
    endDate?: string;
    reason?: string;
}
export declare class GetStudentLeaveRequestsQueryDto {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: string;
    classId?: string;
}
export declare class GetAffectedSessionsQueryDto {
    studentId: string;
    startDate: string;
    endDate: string;
}
