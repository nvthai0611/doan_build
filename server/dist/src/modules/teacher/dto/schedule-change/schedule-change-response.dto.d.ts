export declare class ClassResponseDto {
    id: number;
    name: string;
    description?: string;
}
export declare class SessionResponseDto {
    id: number;
    sessionDate: Date;
    startTime: string;
    endTime: string;
}
export declare class TeacherResponseDto {
    id: number;
    userId: number;
    user: {
        id: number;
        fullName: string;
        email: string;
    };
}
export declare class RoomResponseDto {
    id: number;
    name: string;
    capacity: number;
}
export declare class ScheduleChangeResponseDto {
    id: number;
    classId: number;
    class: ClassResponseDto;
    sessionId: number;
    session: SessionResponseDto;
    changeType: string;
    newDate?: Date;
    newStartTime?: string;
    newEndTime?: string;
    newRoomId?: number;
    newRoom?: RoomResponseDto;
    reason: string;
    notes?: string;
    status: string;
    teacherId: number;
    teacher: TeacherResponseDto;
    createdBy: number;
    approvedBy?: number;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
