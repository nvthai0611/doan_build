import { PrismaService } from '../../../db/prisma.service';
import { SessionDetailResponseDto, StudentInSessionDto } from '../dto/session/session-detail-response.dto';
import { RescheduleSessionDto } from '../dto/session/reschedule-session.dto';
import { CreateSessionDto } from '../dto/session/create-session.dto';
export declare class SessionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private formatDateYYYYMMDD;
    getSessionDetail(teacherId: string, sessionId: string): Promise<SessionDetailResponseDto | null>;
    rescheduleSession(teacherId: string, sessionId: string, rescheduleDto: RescheduleSessionDto): Promise<SessionDetailResponseDto | null>;
    private validateScheduleConflict;
    createSession(teacherId: string, dto: CreateSessionDto): Promise<{
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
    }>;
    getSessionStudents(teacherId: string, sessionId: string): Promise<StudentInSessionDto[]>;
}
