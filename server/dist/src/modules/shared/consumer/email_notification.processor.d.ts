import { Job } from 'bull';
interface StudentAbsenceEmailData {
    to: string;
    studentName: string;
    className: string;
    absenceDate: string;
    sessionTime?: string;
    subject?: string;
    teacherName?: string;
    note?: string;
    sessionId: string;
    studentId: string;
}
export declare class EmailNotificationProcessor {
    handleSendStudentAbsenceEmail(job: Job<StudentAbsenceEmailData>): Promise<{
        success: boolean;
        message: string;
        studentId: string;
        sessionId: string;
        sentTo: string;
        duration: number;
    }>;
    handleSendBatchAbsenceEmails(job: Job<{
        emails: StudentAbsenceEmailData[];
    }>): Promise<{
        success: any[];
        failed: any[];
        total: number;
    }>;
    handleSendClassStartingNotification(job: Job<any>): Promise<{
        success: boolean;
        message: string;
        className: any;
        sentTo: any;
        duration: number;
    }>;
    handleSendClassEndingNotification(job: Job<any>): Promise<{
        success: boolean;
        message: string;
        className: any;
        sentTo: any;
        duration: number;
    }>;
}
export {};
