import { Job } from 'bull';
import { SessionChangeTemplateData } from '../template-email/template-session-change';
interface SessionChangeEmailJob extends SessionChangeTemplateData {
    to: string;
    sessionId: string;
    classId: string;
}
export declare class SessionChangeEmailProcessor {
    handleSessionChange(job: Job<SessionChangeEmailJob>): Promise<{
        success: boolean;
        sessionId: string;
        classId: string;
        sentTo: string;
        duration: number;
    }>;
}
export {};
