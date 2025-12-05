import { PrismaService } from '../../../db/prisma.service';
import { RecordGradesDto } from '../dto/grade/record-grades.dto';
import { UpdateGradeDto } from '../dto/grade/update-grade.dto';
export declare class GradeService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureTeacherCanAccessClass;
    getStudentsOfClass(userId: string, classId: string): Promise<{
        studentId: string;
        fullName: string;
        email: string;
        studentCode: string;
        currentGrade: number;
    }[]>;
    listAssessments(userId: string, classId: string): Promise<({
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
    })[]>;
    listAssessmentTypes(userId: string, classId?: string): Promise<string[]>;
    getExamTypesConfig(userId: string): Promise<any>;
    recordGrades(userId: string, payload: RecordGradesDto): Promise<{
        assessmentId: any;
        gradesRecorded: number;
        totalStudents: number;
    }>;
    updateGrade(userId: string, payload: UpdateGradeDto): Promise<{
        id: bigint;
        studentId: string;
        assessmentId: string;
        score: import("@prisma/client/runtime/library").Decimal | null;
        feedback: string | null;
        gradedBy: string;
        gradedAt: Date;
    }>;
    getAssessmentGrades(userId: string, assessmentId: string): Promise<{
        studentId: string;
        fullName: string;
        score: any;
        feedback: string;
        gradedAt: Date;
    }[]>;
    getTeacherIdFromUserId(userId: string): Promise<string | null>;
    getGradeViewData(teacherId: string, filters: any): Promise<{
        students: any[];
        subjectStats: any[];
        totalStudents: number;
        overallAverage: number;
        passRate: number;
    }>;
    getStudentGrades(teacherId: string, filters: any): Promise<any[]>;
    getSubjectStats(teacherId: string): Promise<any[]>;
    updateStudentGrade(teacherId: string, payload: {
        studentId: string;
        assessmentId: string;
        score: number;
    }): Promise<void>;
    private getWeightByType;
}
