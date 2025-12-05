import { AcademicTrackingService } from '../services/academic-tracking.service';
export declare class AcademicTrackingController {
}
export declare class GradesController {
    private readonly academicTrackingService;
    constructor(academicTrackingService: AcademicTrackingService);
    getClasses(req: any): Promise<{
        data: {
            id: any;
            name: any;
            academicYear: any;
            subjectName: any;
        }[];
        message: string;
    }>;
    getTerms(req: any, academicYear?: string): Promise<{
        data: any[];
        message: string;
    }>;
    getTranscript(req: any, classId?: string, testType?: string, academicYear?: string, term?: string, subjectId?: string): Promise<{
        data: {
            entries: any[];
            overview: {
                cumulativeGpa: number;
            };
        };
        message: string;
    }>;
    getSubjects(req: any, academicYear?: string, term?: string): Promise<{
        data: {
            id: any;
            name: any;
        }[];
        message: string;
    }>;
    getTestTypes(req: any, classId?: string): Promise<{
        data: any[];
        message: string;
    }>;
    getOverview(req: any): Promise<{
        data: {
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
        };
        message: string;
    }>;
}
