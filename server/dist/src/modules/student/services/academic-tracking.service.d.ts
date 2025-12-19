import { PrismaService } from 'src/db/prisma.service';
type TranscriptFilters = {
    classId?: string;
    testType?: string;
    academicYear?: string;
    term?: string;
    subjectId?: string;
    dateStart?: string;
    dateEnd?: string;
};
export declare class AcademicTrackingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTranscript(studentId: string, { classId, testType, academicYear, term, subjectId, dateStart, dateEnd }: TranscriptFilters): Promise<{
        entries: any[];
        overview: {
            cumulativeGpa: number;
        };
    }>;
    getOverview(studentId: string): Promise<{
        totalAcademicYears: number;
        totalSemesters: number;
        totalSubjects: number;
        totalAssessments: number;
        averageScore: number;
        minScore: number;
        maxScore: number;
        passedAssessments: number;
        failedAssessments: number;
        passRate: number;
        cumulativeGpa: number;
    }>;
}
export {};
