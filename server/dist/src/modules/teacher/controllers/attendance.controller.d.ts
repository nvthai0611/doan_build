import { AttendanceService } from '../services/attendance.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
interface SendAbsentNotificationsDto {
    studentIds: string[];
}
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly emailNotificationService;
    constructor(attendanceService: AttendanceService, emailNotificationService: EmailNotificationService);
    getListStudentBySessionId(sessionId: string): Promise<{
        class: {
            enrollments: ({
                student: {
                    user: {
                        fullName: string;
                        id: string;
                        avatar: string;
                    };
                } & {
                    createdAt: Date;
                    grade: string | null;
                    id: string;
                    parentId: string | null;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    scholarshipId: string | null;
                };
            } & {
                status: string;
                id: bigint;
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
            name: string;
            description: string | null;
            password: string | null;
            status: string;
            gradeId: string | null;
            subjectId: string;
            roomId: string | null;
            teacherId: string | null;
            feeStructureId: string | null;
            createdAt: Date;
            academicYear: string | null;
            id: string;
            updatedAt: Date;
            classCode: string | null;
            maxStudents: number | null;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
        };
    } & {
        status: string;
        roomId: string | null;
        teacherId: string | null;
        createdAt: Date;
        academicYear: string;
        id: string;
        notes: string | null;
        classId: string;
        substituteTeacherId: string | null;
        substituteEndDate: Date | null;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        cancellationReason: string | null;
    }>;
    getLeaveRequestsBySessionId(sessionId: string): Promise<({
        leaveRequest: {
            student: {
                user: {
                    fullName: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            };
            createdByUser: {
                fullName: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string | null;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            notes: string | null;
            studentId: string | null;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            imageUrl: string | null;
        };
    } & {
        createdAt: Date;
        id: string;
        notes: string | null;
        sessionId: string;
        leaveRequestId: string;
        replacementTeacherId: string | null;
    })[]>;
    checkLeaveRequestsStatus(sessionId: string): Promise<({
        leaveRequest: {
            student: {
                user: {
                    fullName: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            };
            createdByUser: {
                fullName: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string | null;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            notes: string | null;
            studentId: string | null;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            imageUrl: string | null;
        };
    } & {
        createdAt: Date;
        id: string;
        notes: string | null;
        sessionId: string;
        leaveRequestId: string;
        replacementTeacherId: string | null;
    })[]>;
    getAttendanceBySessionId(sessionId: string): Promise<({
        student: {
            user: {
                fullName: string;
                id: string;
                avatar: string;
            };
        } & {
            createdAt: Date;
            grade: string | null;
            id: string;
            parentId: string | null;
            updatedAt: Date;
            userId: string;
            studentCode: string | null;
            address: string | null;
            schoolId: string;
            scholarshipId: string | null;
        };
        session: {
            class: {
                name: string;
                id: string;
            };
        } & {
            status: string;
            roomId: string | null;
            teacherId: string | null;
            createdAt: Date;
            academicYear: string;
            id: string;
            notes: string | null;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            cancellationReason: string | null;
        };
    } & {
        status: string;
        id: bigint;
        studentId: string;
        sessionId: string;
        note: string | null;
        recordedBy: string;
        recordedAt: Date;
        isSent: boolean;
        sentAt: Date | null;
    })[]>;
    attendanceStudentBySessionId(sessionId: string, body: {
        records: any[];
    }, req: any): Promise<any>;
    sendAbsentNotifications(request: any, sessionId: string, body: SendAbsentNotificationsDto): Promise<{
        data: {
            success: boolean;
            sentCount: number;
            failCount: number;
            alreadySentCount: number;
            totalStudents: number;
            details: any[];
            message: string;
        };
        message: string;
    }>;
}
export {};
