import { HttpStatus } from '@nestjs/common';
import { GradeService } from '../services/grade.service';
import { RecordGradesDto } from '../dto/grade/record-grades.dto';
import { UpdateGradeDto } from '../dto/grade/update-grade.dto';
export declare class GradeController {
    private readonly gradeService;
    constructor(gradeService: GradeService);
    getGradeViewData(request: any, filters: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            students: any[];
            subjectStats: any[];
            totalStudents: number;
            overallAverage: number;
            passRate: number;
        };
        message: string;
        meta: any;
    } | {
        success: boolean;
        status: HttpStatus;
        data: {
            students: any[];
            subjectStats: any[];
            totalStudents: number;
            overallAverage: number;
            passRate: number;
        };
        message: any;
        meta: any;
    }>;
    getStudentGrades(request: any, filters: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: any[];
        message: string;
        meta: any;
    } | {
        success: boolean;
        status: HttpStatus;
        data: any[];
        message: any;
        meta: any;
    }>;
    getSubjectStats(request: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: any[];
        message: string;
        meta: any;
    } | {
        success: boolean;
        status: HttpStatus;
        data: any[];
        message: any;
        meta: any;
    }>;
    getStudents(request: any, classId: string): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            studentId: string;
            fullName: string;
            email: string;
            studentCode: string;
            currentGrade: number;
        }[];
        message: string;
        meta: any;
    } | {
        success: boolean;
        status: HttpStatus;
        data: any[];
        message: any;
        meta: any;
    }>;
    getAssessments(request: any, classId: string): Promise<{
        success: boolean;
        status: HttpStatus;
        data: ({
            class: {
                subject: {
                    name: string;
                };
                name: string;
            };
            grades: ({
                student: {
                    user: {
                        email: string;
                        fullName: string;
                    };
                } & {
                    grade: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
            } & {
                id: bigint;
                studentId: string;
                assessmentId: string;
                score: import("@prisma/client/runtime/library").Decimal | null;
                feedback: string | null;
                gradedBy: string;
                gradedAt: Date;
            })[];
        } & {
            createdAt: Date;
            id: string;
            name: string;
            type: string;
            description: string | null;
            classId: string;
            date: Date;
            maxScore: import("@prisma/client/runtime/library").Decimal;
        })[];
        message: string;
        meta: any;
    }>;
    getAssessmentTypes(request: any, classId?: string): Promise<{
        success: boolean;
        status: HttpStatus;
        data: string[];
        message: string;
        meta: any;
    }>;
    getExamTypesConfig(request: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: any;
        message: string;
        meta: any;
    }>;
    getAssessmentGrades(request: any, assessmentId: string): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            studentId: string;
            fullName: string;
            score: any;
            feedback: string;
            gradedAt: Date;
        }[];
        message: string;
        meta: any;
    }>;
    record(request: any, payload: RecordGradesDto): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            assessmentId: any;
            gradesRecorded: number;
            totalStudents: number;
        };
        message: string;
        meta: any;
    } | {
        success: boolean;
        status: HttpStatus;
        data: any;
        message: any;
        meta: any;
    }>;
    update(request: any, payload: UpdateGradeDto): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            id: bigint;
            studentId: string;
            assessmentId: string;
            score: import("@prisma/client/runtime/library").Decimal | null;
            feedback: string | null;
            gradedBy: string;
            gradedAt: Date;
        };
        message: string;
        meta: any;
    }>;
    updateStudentGrade(request: any, payload: {
        studentId: string;
        assessmentId: string;
        score: number;
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        data: any;
        message: any;
        meta: any;
    }>;
}
