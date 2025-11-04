export declare class StudentInSessionDto {
    id: string;
    name: string;
    avatar?: string;
    attendanceStatus?: string;
}
export declare class SessionDetailResponseDto {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    subject: string;
    className: string;
    room: string;
    studentCount: number;
    status: string;
    notes?: string;
    type: string;
    teacherId: string;
    teacherName?: string;
    students?: StudentInSessionDto[];
    createdAt: Date;
    updatedAt: Date;
}
