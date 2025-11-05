import { PrismaService } from '../../../db/prisma.service';
import { Queue } from 'bull';
export declare class EmailNotificationService {
    private prisma;
    private readonly emailNotificationQueue;
    private readonly teacherAccountQueue;
    private readonly classAssignTeacherQueue;
    private readonly enrollmentEmailQueue;
    private readonly classStatusChangeEmailQueue;
    private readonly classRequestEmailQueue;
    constructor(prisma: PrismaService, emailNotificationQueue: Queue, teacherAccountQueue: Queue, classAssignTeacherQueue: Queue, enrollmentEmailQueue: Queue, classStatusChangeEmailQueue: Queue, classRequestEmailQueue: Queue);
    private getStatusLabel;
    sendStudentAbsenceEmail(studentIds: string[], sessionId: string, teacherId: string): Promise<{
        success: boolean;
        sentCount: number;
        failCount: number;
        alreadySentCount: number;
        totalStudents: number;
        details: any[];
        message: string;
    }>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        total: number;
    }>;
    sendTeacherAccountEmail(teacherId: string, teacherName: string, username: string, email: string, password: string, teacherCode: string): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        email: string;
    }>;
    sendClassAssignTeacherEmail(classId: string, teacherId: string): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        classId: string;
        email: string;
    }>;
    sendClassRemoveTeacherEmail(classId: string, teacherId: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        teacherId: string;
        classId: string;
        email: string;
    }>;
    sendBulkEnrollmentEmail(studentIds: string[], classId: string, transferInfo?: {
        oldClassId: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        sentCount: number;
        failCount: number;
        totalStudents: number;
        details: any[];
        message: string;
    }>;
    sendClassStatusChangeEmailToParents(classId: string, oldStatus: string, newStatus: string): Promise<{
        success: boolean;
        skipped: boolean;
        reason: string;
        sentCount?: undefined;
        failCount?: undefined;
        totalParents?: undefined;
        details?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sentCount: number;
        failCount: number;
        totalParents: number;
        details: any[];
        skipped?: undefined;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        reason?: undefined;
        sentCount?: undefined;
        failCount?: undefined;
        totalParents?: undefined;
        details?: undefined;
    }>;
    sendClassRequestApprovalEmail(requestId: string, studentId: string, classId: string, parentEmail: string, parentName: string, studentName: string, className: string, subjectName: string, teacherName?: string, startDate?: string, schedule?: any, username?: string, password?: string): Promise<{
        success: boolean;
        message: string;
        parentEmail: string;
        requestId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        parentEmail?: undefined;
        requestId?: undefined;
    }>;
    sendClassRequestRejectionEmail(requestId: string, studentId: string, classId: string, parentEmail: string, parentName: string, studentName: string, className: string, subjectName: string, reason: string): Promise<{
        success: boolean;
        message: string;
        parentEmail: string;
        requestId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        parentEmail?: undefined;
        requestId?: undefined;
    }>;
    sendClassStartingNotificationEmail(to: string, data: {
        className: string;
        classCode?: string;
        subjectName: string;
        gradeName: string;
        daysRemaining: number;
        startDate: string;
        teacherName: string;
        roomName: string;
        scheduleText: string;
        currentStudents: number;
        maxStudents: number | string;
        hasTeacher: boolean;
        hasRoom: boolean;
        hasStudents: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        to: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        to?: undefined;
    }>;
    sendClassEndingNotificationEmail(to: string, data: {
        className: string;
        classCode?: string;
        subjectName: string;
        gradeName: string;
        daysRemaining: number;
        endDate: string;
        teacherName: string;
        roomName: string;
        scheduleText: string;
        currentStudents: number;
        maxStudents: number | string;
    }): Promise<{
        success: boolean;
        message: string;
        to: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        to?: undefined;
    }>;
}
