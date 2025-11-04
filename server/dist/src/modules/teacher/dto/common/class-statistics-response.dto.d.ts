export declare class AttendanceStatsDto {
    status: string;
    _count: {
        status: number;
    };
}
export declare class GradeStatsDto {
    _avg?: {
        score?: number;
    };
    _max?: {
        score?: number;
    };
    _min?: {
        score?: number;
    };
}
export declare class ClassStatisticsDataDto {
    totalStudents: number;
    attendanceStats: AttendanceStatsDto[];
    gradeStats: GradeStatsDto;
}
export declare class ClassStatisticsResponseDto {
    success: boolean;
    data: ClassStatisticsDataDto;
    message: string;
}
