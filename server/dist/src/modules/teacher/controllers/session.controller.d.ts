import { SessionService } from '../services/session.service';
import { SessionDetailResponseDto } from '../dto/session/session-detail-response.dto';
import { RescheduleSessionDto } from '../dto/session/reschedule-session.dto';
import { CreateSessionDto } from '../dto/session/create-session.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getSessionDetail(req: any, sessionId: string): Promise<{
        success: boolean;
        data: SessionDetailResponseDto;
        message: string;
    }>;
    createSession(req: any, dto: CreateSessionDto): Promise<{
        success: boolean;
        data: {
            room: {
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
        message: string;
    }>;
    rescheduleSession(req: any, sessionId: string, rescheduleDto: RescheduleSessionDto): Promise<{
        success: boolean;
        data: SessionDetailResponseDto;
        message: string;
    }>;
    getSessionStudents(req: any, sessionId: string): Promise<{
        success: boolean;
        data: import("../dto/session/session-detail-response.dto").StudentInSessionDto[];
        message: string;
    }>;
}
