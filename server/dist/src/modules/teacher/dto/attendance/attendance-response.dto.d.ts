export declare class UserResponseDto {
    avatar: string;
    fullName: string;
}
export declare class StudentResponseDto {
    id: string;
    userId: string;
    studentCode: string;
    address: string;
    grade: string;
    schoolId: string;
    parentId: string;
    user: UserResponseDto;
}
export declare class ClassResponseDto {
    name: string;
}
export declare class SessionResponseDto {
    id: string;
    classId: string;
    academicYear: string;
    sessionDate: Date;
    startTime: string;
    endTime: string;
    roomId: string;
    status: string;
    notes: string;
    createdAt: Date;
    class: ClassResponseDto;
}
export declare class AttendanceResponseDto {
    id: string;
    sessionId: string;
    studentId: string;
    status: string;
    note?: string;
    recordedBy: string;
    recordedAt: Date;
    student: StudentResponseDto;
    session: SessionResponseDto;
}
export declare class GetAttendanceResponseDto {
    data: AttendanceResponseDto[];
    message: string;
}
