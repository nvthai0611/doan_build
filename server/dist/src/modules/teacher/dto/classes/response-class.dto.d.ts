export declare class RoomDto {
    id: string;
    name: string;
    description?: string;
}
export declare class ClassDto {
    id: string;
    name: string;
    teacherId: string;
    room: RoomDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ClassesListResponseDto {
    success: boolean;
    message: string;
    data: ClassDto[];
}
export declare class ClassResponseDto {
    success: boolean;
    message: string;
    data: ClassDto;
}
export declare class CountByStatusResponseDto {
    total: number;
    active: number;
    completed: number;
    draft: number;
    cancelled: number;
}
