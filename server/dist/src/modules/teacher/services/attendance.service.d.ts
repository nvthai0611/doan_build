import { PrismaService } from 'src/db/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getListStudentBySessionId(sessionId: string): Promise<{
        class: {
            enrollments: ({
                student: {
                    user: {
                        id: string;
                        fullName: string;
                        avatar: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    grade: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
            } & {
                id: bigint;
                studentId: string;
                classId: string;
                status: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            })[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            password: string | null;
            updatedAt: Date;
            name: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
    } & {
        id: string;
        classId: string;
        status: string;
        createdAt: Date;
        roomId: string | null;
        teacherId: string | null;
        academicYear: string;
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
                id: string;
                fullName: string;
                avatar: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        session: {
            class: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            classId: string;
            status: string;
            createdAt: Date;
            roomId: string | null;
            teacherId: string | null;
            academicYear: string;
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
        studentId: string;
        status: string;
        note: string | null;
        sessionId: string;
        recordedBy: string;
        recordedAt: Date;
        isSent: boolean;
        sentAt: Date | null;
    })[]>;
    getLeaveRequestsBySessionId(sessionId: string): Promise<({
        leaveRequest: {
            student: {
                user: {
                    id: string;
                    fullName: string;
                    avatar: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            createdByUser: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            studentId: string | null;
            status: string;
            createdAt: Date;
            teacherId: string | null;
            startDate: Date;
            notes: string | null;
            reason: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            endDate: Date;
            requestType: string;
            createdBy: string;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        replacementTeacherId: string | null;
        sessionId: string;
        leaveRequestId: string;
    })[]>;
    attendanceStudentBySessionId(sessionId: string, records: any[], teacherId: string, userId: string): Promise<any>;
    private approveLeaveRequestsForStudents;
    private validateAttendanceTime;
    private getDateStart;
    private getDateEnd;
}
