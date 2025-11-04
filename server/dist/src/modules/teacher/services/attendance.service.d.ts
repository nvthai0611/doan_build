import { PrismaService } from 'src/db/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getListStudentBySessionId(sessionId: string): Promise<{
        class: {
            enrollments: ({
                student: {
                    user: {
                        fullName: string;
                        avatar: string;
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
                status: string;
                studentId: string;
                classId: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            })[];
        } & {
            academicYear: string | null;
            password: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            name: string;
            description: string | null;
            subjectId: string;
            gradeId: string | null;
            maxStudents: number | null;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeStructureId: string | null;
            classCode: string | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
    } & {
        academicYear: string;
        createdAt: Date;
        id: string;
        roomId: string | null;
        teacherId: string | null;
        status: string;
        classId: string;
        substituteTeacherId: string | null;
        substituteEndDate: Date | null;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        notes: string | null;
        cancellationReason: string | null;
    }>;
    getAttendanceBySessionId(sessionId: string): Promise<({
        student: {
            user: {
                fullName: string;
                avatar: string;
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
        session: {
            class: {
                name: string;
            };
        } & {
            academicYear: string;
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            notes: string | null;
            cancellationReason: string | null;
        };
    } & {
        id: bigint;
        sessionId: string;
        status: string;
        studentId: string;
        note: string | null;
        recordedBy: string;
        recordedAt: Date;
        isSent: boolean;
        sentAt: Date | null;
    })[]>;
    attendanceStudentBySessionId(sessionId: string, records: any[], teacherId: string): Promise<{
        data: {
            updated: number;
            total: number;
        };
        message: string;
    }>;
}
