declare class GradeEntryDto {
    studentId: string;
    score?: number;
    feedback?: string;
}
export declare class RecordGradesDto {
    classId: string;
    assessmentName: string;
    assessmentType: string;
    maxScore?: number;
    date: string;
    description?: string;
    grades: GradeEntryDto[];
}
export { GradeEntryDto };
